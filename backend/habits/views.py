from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import IntegrityError
from .models import Habit, CheckIn
from .serializers import HabitSerializer, HabitDetailSerializer, CheckInSerializer

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

        return Response(
            {
                "message": f"Star illuminated for {habit.name} on {check_date}!",
                "checkin": CheckInSerializer(checkin).data,
                "current_streak": current_streak,
                "best_streak": best_streak,
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
