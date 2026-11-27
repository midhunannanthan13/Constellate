from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import IntegrityError, connection
from .models import Habit, CheckIn
from .serializers import HabitSerializer, HabitDetailSerializer, CheckInSerializer
from badges.services import evaluate_and_award_badges

class HabitViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Enforce strict data isolation:
        Users can ONLY view and modify their own habits.
        """
        qs = Habit.objects.filter(user=self.request.user)
        # By default list active habits; allow ?archived=true to view archived habits
        show_archived = self.request.query_params.get('archived', '').lower() in ('true', '1')
        if not show_archived:
            qs = qs.filter(archived=False)
        return qs

    def get_serializer_class(self):
        if self.action in ('retrieve', 'history'):
            return HabitDetailSerializer
        return HabitSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        habit_name = instance.name
        self.perform_destroy(instance)
        return Response(
            {"message": f"Habit '{habit_name}' and its celestial check-ins were removed."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """Toggle or set archive state."""
        habit = self.get_object()
        habit.archived = not habit.archived
        habit.save()
        status_text = "archived" if habit.archived else "restored to active sky"
        return Response(
            {"message": f"Habit '{habit.name}' was {status_text}.", "archived": habit.archived},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def checkin(self, request, pk=None):
        """Check in for today or a specific date."""
        habit = self.get_object()
        date_str = request.data.get('date')
        note = request.data.get('note', '').strip()

        today = timezone.localdate()
        if date_str:
            try:
                check_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"message": "Invalid date format. Please use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            check_date = today

        # Reject future dates
        if check_date > today:
            return Response(
                {"message": f"Cannot check in for future date {check_date}. Today is {today}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for existing check-in on this date (enforce 1 per day)
        existing = CheckIn.objects.filter(habit=habit, date=check_date).first()
        if existing:
            return Response(
                {
                    "message": f"Habit '{habit.name}' already has a check-in for {check_date}.",
                    "checkin": CheckInSerializer(existing).data
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checkin = CheckIn.objects.create(habit=habit, date=check_date, note=note or None)
        except IntegrityError:
            return Response(
                {"message": f"Check-in conflict for date {check_date}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        current_streak, best_streak = habit.calculate_streaks()
        newly_earned = evaluate_and_award_badges(request.user)

        return Response(
            {
                "message": f"Star illuminated for {habit.name} on {check_date}!",
                "checkin": CheckInSerializer(checkin).data,
                "current_streak": current_streak,
                "best_streak": best_streak,
                "newly_earned_badges": newly_earned,
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post', 'delete'])
    def uncheck(self, request, pk=None):
        """Un-check (remove) check-in for a given day."""
        habit = self.get_object()
        date_str = request.data.get('date') or request.query_params.get('date')

        today = timezone.localdate()
        if date_str:
            try:
                check_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"message": "Invalid date format. Please use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            check_date = today

        deleted_count, _ = CheckIn.objects.filter(habit=habit, date=check_date).delete()

        if deleted_count == 0:
            return Response(
                {"message": f"No check-in found for {habit.name} on {check_date} to remove."},
                status=status.HTTP_404_NOT_FOUND
            )

        current_streak, best_streak = habit.calculate_streaks()

        return Response(
            {
                "message": f"Check-in removed for {habit.name} on {check_date}.",
                "current_streak": current_streak,
                "best_streak": best_streak,
            },
            status=status.HTTP_200_OK
        )


class MySkyView(viewsets.ViewSet):
    """
    Lightweight, single-request endpoint returning the signed-in user's
    active habits with streaks, 60-day check-in dates, and friend code.
    Powers the animated personal night sky.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        today = timezone.localdate()
        cutoff_date = today - timedelta(days=60)

        # Get active habits
        habits = Habit.objects.filter(user=user, archived=False).order_by('created_at')

        # Efficiently fetch all check-ins for the user in the last 60 days in one query
        all_checkins = CheckIn.objects.filter(
            habit__user=user,
            habit__archived=False,
            date__gte=cutoff_date,
            date__lte=today
        ).order_by('date')

        # Group check-ins by habit_id
        checkins_by_habit = {}
        for c in all_checkins:
            checkins_by_habit.setdefault(c.habit_id, []).append({
                "id": c.id,
                "date": c.date.strftime('%Y-%m-%d'),
                "note": c.note or ""
            })

        habits_data = []
        for h in habits:
            current_streak, best_streak = h.calculate_streaks()
            h_checkins = checkins_by_habit.get(h.id, [])
            checkin_dates_set = {c["date"] for c in h_checkins}
            is_checked_today = today.strftime('%Y-%m-%d') in checkin_dates_set

            habits_data.append({
                "id": h.id,
                "name": h.name,
                "colour": h.colour,
                "days_per_week_goal": h.days_per_week_goal,
                "current_streak": current_streak,
                "best_streak": best_streak,
                "total_checkins": h.check_ins.count(),
                "is_checked_today": is_checked_today,
                "is_constellation_complete": current_streak >= 7,
                "checkins": h_checkins
            })

        # Friend code
        friend_code = getattr(user.profile, 'friend_code', None) if hasattr(user, 'profile') else None

        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "friend_code": friend_code
            },
            "today": today.strftime('%Y-%m-%d'),
            "habits": habits_data
        }, status=status.HTTP_200_OK)


class WeeklyReportView(viewsets.ViewSet):
    """
    Powers the Weekly Sky Report.
    Reads habit 7-day & previous-7-day summaries directly from the MySQL view
    `weekly_habit_summary_view`, scoped strictly to the signed-in user.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        user = request.user
        today = timezone.localdate()

        # 1. Read habit summaries directly from MySQL view weekly_habit_summary_view
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    habit_id,
                    habit_name,
                    colour,
                    days_per_week_goal,
                    this_week_checkins,
                    last_week_checkins
                FROM weekly_habit_summary_view
                WHERE user_id = %s AND archived = 0
                ORDER BY habit_id ASC
                """,
                [user.id],
            )
            view_rows = cursor.fetchall()

        if not view_rows:
            return Response({
                "has_habits": False,
                "total_this_week": 0,
                "total_last_week": 0,
                "best_current_streak": 0,
                "most_consistent_habit": None,
                "quietest_day": None,
                "daily_checkins": [
                    {
                        "date": (today - timedelta(days=i)).strftime('%Y-%m-%d'),
                        "day_name": (today - timedelta(days=i)).strftime('%a'),
                        "count": 0,
                    }
                    for i in range(6, -1, -1)
                ],
                "habits_progress": [],
            }, status=status.HTTP_200_OK)

        # Map streaks for active habits
        habits_by_id = {
            h.id: h for h in Habit.objects.filter(user=user, archived=False)
        }

        total_this_week = 0
        total_last_week = 0
        best_current_streak = 0
        habits_progress = []
        most_consistent = None

        for row in view_rows:
            habit_id, habit_name, colour, goal, this_week, last_week = row
            this_week = int(this_week or 0)
            last_week = int(last_week or 0)
            goal = int(goal or 1)

            total_this_week += this_week
            total_last_week += last_week

            habit_obj = habits_by_id.get(habit_id)
            current_streak, best_streak = habit_obj.calculate_streaks() if habit_obj else (0, 0)
            if current_streak > best_current_streak:
                best_current_streak = current_streak

            ratio = this_week / goal
            progress_percent = min(100, round(ratio * 100))

            habit_entry = {
                "id": habit_id,
                "name": habit_name,
                "colour": colour,
                "days_per_week_goal": goal,
                "this_week_checkins": this_week,
                "last_week_checkins": last_week,
                "current_streak": current_streak,
                "best_streak": best_streak,
                "progress_percent": progress_percent,
            }
            habits_progress.append(habit_entry)

            if this_week > 0:
                if most_consistent is None:
                    most_consistent = (ratio, current_streak, habit_entry)
                else:
                    if (ratio, current_streak) > (most_consistent[0], most_consistent[1]):
                        most_consistent = (ratio, current_streak, habit_entry)

        # 2. Check-ins per day for the last 7 days (including today)
        seven_days_ago = today - timedelta(days=6)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT c.date, COUNT(*)
                FROM check_ins c
                INNER JOIN habits h ON c.habit_id = h.id
                WHERE h.user_id = %s
                  AND h.archived = 0
                  AND c.date >= %s
                  AND c.date <= %s
                GROUP BY c.date
                """,
                [user.id, seven_days_ago, today],
            )
            daily_counts = {
                row[0].strftime('%Y-%m-%d'): int(row[1])
                for row in cursor.fetchall()
            }

        daily_checkins = []
        for i in range(6, -1, -1):
            d = today - timedelta(days=i)
            d_str = d.strftime('%Y-%m-%d')
            daily_checkins.append({
                "date": d_str,
                "day_name": d.strftime('%a'),
                "full_day_name": d.strftime('%A'),
                "count": daily_counts.get(d_str, 0),
            })

        # 3. Quietest day of the week over the last 4 weeks (28 days)
        four_weeks_ago = today - timedelta(days=27)
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT DAYNAME(c.date) AS weekday_name, COUNT(*) AS cnt
                FROM check_ins c
                INNER JOIN habits h ON c.habit_id = h.id
                WHERE h.user_id = %s
                  AND h.archived = 0
                  AND c.date >= %s
                  AND c.date <= %s
                GROUP BY DAYNAME(c.date)
                """,
                [user.id, four_weeks_ago, today],
            )
            weekday_counts_raw = dict(cursor.fetchall())

        total_4_weeks = sum(int(v) for v in weekday_counts_raw.values())
        quietest_day = None
        if total_4_weeks > 0:
            weekdays_order = [
                'Monday', 'Tuesday', 'Wednesday', 'Thursday',
                'Friday', 'Saturday', 'Sunday'
            ]
            quietest_name = min(
                weekdays_order,
                key=lambda wd: int(weekday_counts_raw.get(wd, 0))
            )
            quietest_day = {
                "day_name": quietest_name,
                "count": int(weekday_counts_raw.get(quietest_name, 0)),
            }

        return Response({
            "has_habits": True,
            "total_this_week": total_this_week,
            "total_last_week": total_last_week,
            "best_current_streak": best_current_streak,
            "most_consistent_habit": most_consistent[2] if most_consistent else None,
            "quietest_day": quietest_day,
            "daily_checkins": daily_checkins,
            "habits_progress": habits_progress,
        }, status=status.HTTP_200_OK)


