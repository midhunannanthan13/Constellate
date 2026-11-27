from datetime import timedelta
from django.db import connection, IntegrityError
from django.db.models import Q
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from accounts.models import Profile
from habits.models import Habit, CheckIn
from .models import Friendship


def _get_friend_code(user):
    if hasattr(user, 'profile'):
        return user.profile.friend_code
    return None


class FriendsOverviewView(APIView):
    """
    Returns the signed-in user's own friend code, accepted friends,
    incoming pending requests, and outgoing pending requests.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        accepted = Friendship.objects.filter(
            Q(requester=user) | Q(receiver=user),
            status=Friendship.STATUS_ACCEPTED,
        ).select_related('requester__profile', 'receiver__profile')

        friends_list = []
        for f in accepted:
            other = f.receiver if f.requester_id == user.id else f.requester
            friends_list.append({
                "friendship_id": f.id,
                "friend_id": other.id,
                "username": other.username,
                "friend_code": _get_friend_code(other),
                "since": f.updated_at.isoformat(),
            })

        incoming = Friendship.objects.filter(
            receiver=user,
            status=Friendship.STATUS_PENDING,
        ).select_related('requester__profile')

        incoming_list = [
            {
                "friendship_id": f.id,
                "user_id": f.requester.id,
                "username": f.requester.username,
                "friend_code": _get_friend_code(f.requester),
                "created_at": f.created_at.isoformat(),
            }
            for f in incoming
        ]

        outgoing = Friendship.objects.filter(
            requester=user,
            status=Friendship.STATUS_PENDING,
        ).select_related('receiver__profile')

        outgoing_list = [
            {
                "friendship_id": f.id,
                "user_id": f.receiver.id,
                "username": f.receiver.username,
                "friend_code": _get_friend_code(f.receiver),
                "created_at": f.created_at.isoformat(),
            }
            for f in outgoing
        ]

        return Response({
            "my_friend_code": _get_friend_code(user),
            "friends": friends_list,
            "incoming_requests": incoming_list,
            "outgoing_requests": outgoing_list,
        }, status=status.HTTP_200_OK)


class SendFriendRequestView(APIView):
    """Send a friend request using another user's unique friend code."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_code = (request.data.get('friend_code') or '').strip().upper()
        if not raw_code:
            return Response(
                {"message": "Please enter a friend code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_profile = Profile.objects.select_related('user').filter(
            friend_code__iexact=raw_code
        ).first()

        if not target_profile:
            return Response(
                {"message": f"No stargazer found with friend code '{raw_code}'. Please double-check and try again."},
                status=status.HTTP_404_NOT_FOUND,
            )

        target_user = target_profile.user

        # Prevent befriending yourself
        if target_user.id == request.user.id:
            return Response(
                {"message": "You cannot send a friend request to yourself."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent direct duplicates (A -> B) AND reverse duplicates (B -> A)
        existing = Friendship.objects.filter(
            Q(requester=request.user, receiver=target_user) |
            Q(requester=target_user, receiver=request.user)
        ).first()

        if existing:
            if existing.status == Friendship.STATUS_ACCEPTED:
                return Response(
                    {"message": f"You are already friends with {target_user.username}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if existing.requester_id == request.user.id:
                return Response(
                    {"message": f"You already have a pending friend request to {target_user.username}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"message": f"{target_user.username} has already sent you a friend request! Accept it in your incoming requests."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            friendship = Friendship.objects.create(
                requester=request.user,
                receiver=target_user,
                status=Friendship.STATUS_PENDING,
            )
        except IntegrityError:
            return Response(
                {"message": "A friend request already exists between you and this user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "message": f"Friend request sent to {target_user.username}!",
            "request": {
                "friendship_id": friendship.id,
                "user_id": target_user.id,
                "username": target_user.username,
                "friend_code": target_profile.friend_code,
                "status": friendship.status,
            },
        }, status=status.HTTP_201_CREATED)


class AcceptFriendRequestView(APIView):
    """Accept an incoming pending friend request."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        friendship = Friendship.objects.filter(
            id=pk,
            receiver=request.user,
            status=Friendship.STATUS_PENDING,
        ).select_related('requester').first()

        if not friendship:
            return Response(
                {"message": "Pending friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        friendship.status = Friendship.STATUS_ACCEPTED
        friendship.save()

        return Response({
            "message": f"You and {friendship.requester.username} are now friends!",
            "friendship_id": friendship.id,
            "status": friendship.status,
        }, status=status.HTTP_200_OK)


class DeclineFriendRequestView(APIView):
    """Decline an incoming pending friend request."""
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        friendship = Friendship.objects.filter(
            id=pk,
            receiver=request.user,
            status=Friendship.STATUS_PENDING,
        ).select_related('requester').first()

        if not friendship:
            return Response(
                {"message": "Pending friend request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        requester_name = friendship.requester.username
        friendship.delete()

        return Response({
            "message": f"Declined friend request from {requester_name}.",
        }, status=status.HTTP_200_OK)


class RemoveFriendView(APIView):
    """Remove an accepted friend or cancel an outgoing pending request."""
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        friendship = Friendship.objects.filter(
            Q(requester=request.user) | Q(receiver=request.user),
            id=pk,
        ).first()

        if not friendship:
            return Response(
                {"message": "Friendship not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        friendship.delete()
        return Response({
            "message": "Friend removed successfully.",
        }, status=status.HTTP_200_OK)


class FriendSkyView(APIView):
    """
    Read-only view of an accepted friend's sky.
    Uses an explicit SQL INNER JOIN between `habits` and `friendships`.
    Never exposes email, password, or private check-in notes.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, friend_id):
        viewer = request.user

        if friend_id == viewer.id:
            return Response(
                {"message": "Visit My Sky to view your own constellations."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target_user = User.objects.select_related('profile').filter(id=friend_id).first()
        if not target_user:
            return Response(
                {"message": "Stargazer not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Verify accepted friendship exists
        is_accepted = Friendship.objects.filter(
            Q(requester=viewer, receiver=target_user) |
            Q(requester=target_user, receiver=viewer),
            status=Friendship.STATUS_ACCEPTED,
        ).exists()

        if not is_accepted:
            return Response(
                {"message": "You can only view another stargazer's sky after they accept your friend request."},
                status=status.HTTP_403_FORBIDDEN,
            )

        today = timezone.localdate()
        cutoff_date = today - timedelta(days=60)
        today_str = today.strftime('%Y-%m-%d')

        # Explicit SQL INNER JOIN between friendships and habits
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    h.id,
                    h.name,
                    h.colour,
                    h.days_per_week_goal
                FROM habits h
                INNER JOIN friendships f
                    ON (
                        (f.requester_id = %s AND f.receiver_id = h.user_id)
                        OR
                        (f.receiver_id = %s AND f.requester_id = h.user_id)
                    )
                WHERE h.user_id = %s
                  AND h.archived = 0
                  AND f.status = 'accepted'
                ORDER BY h.created_at ASC
                """,
                [viewer.id, viewer.id, friend_id],
            )
            joined_habit_rows = cursor.fetchall()

        habit_ids = [row[0] for row in joined_habit_rows]
        habits_by_id = {
            h.id: h for h in Habit.objects.filter(id__in=habit_ids)
        }

        # Fetch last 60 days check-in dates (no private notes exposed)
        checkins_by_habit = {}
        if habit_ids:
            recent_checkins = CheckIn.objects.filter(
                habit_id__in=habit_ids,
                date__gte=cutoff_date,
                date__lte=today,
            ).order_by('date').values('id', 'habit_id', 'date')

            for c in recent_checkins:
                checkins_by_habit.setdefault(c['habit_id'], []).append({
                    "id": c['id'],
                    "date": c['date'].strftime('%Y-%m-%d'),
                })

        habits_data = []
        for habit_id, name, colour, goal in joined_habit_rows:
            habit_obj = habits_by_id.get(habit_id)
            current_streak, best_streak = habit_obj.calculate_streaks() if habit_obj else (0, 0)
            h_checkins = checkins_by_habit.get(habit_id, [])
            is_checked_today = any(c['date'] == today_str for c in h_checkins)

            habits_data.append({
                "id": habit_id,
                "name": name,
                "colour": colour,
                "days_per_week_goal": goal,
                "current_streak": current_streak,
                "best_streak": best_streak,
                "is_checked_today": is_checked_today,
                "is_constellation_complete": current_streak >= 7,
                "checkins": h_checkins,
            })

        return Response({
            "friend": {
                "id": target_user.id,
                "username": target_user.username,
                "friend_code": _get_friend_code(target_user),
            },
            "today": today_str,
            "habits": habits_data,
        }, status=status.HTTP_200_OK)
