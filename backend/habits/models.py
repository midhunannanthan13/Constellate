from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from datetime import timedelta, date

AURORA_COLORS = [
    ('#FFD76A', 'Star Gold'),
    ('#3EE6C3', 'Aurora Teal'),
    ('#8B7CFF', 'Aurora Violet'),
    ('#FF7AC6', 'Aurora Pink'),
    ('#4ADE80', 'Aurora Green'),
    ('#60A5FA', 'Celestial Blue'),
]

class Habit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits', db_index=True)
    name = models.CharField(max_length=120)
    colour = models.CharField(max_length=24, default='#FFD76A')
    days_per_week_goal = models.PositiveSmallIntegerField(
        default=7,
        validators=[MinValueValidator(1), MaxValueValidator(7)],
        help_text="Target frequency from 1 to 7 days per week"
    )
    archived = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'habits'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'archived'], name='habit_user_archived_idx'),
            models.Index(fields=['user', 'created_at'], name='habit_user_created_idx'),
        ]

    def __str__(self):
        return f"{self.name} ({self.user.username})"

    def calculate_streaks(self):
        """
        Calculates the current streak and best streak from all check-in dates.
        Returns a tuple: (current_streak, best_streak).
        """
        checkin_dates = set(
            self.check_ins.values_list('date', flat=True)
        )
        if not checkin_dates:
            return 0, 0

        # Sort dates in ascending order
        sorted_dates = sorted(list(checkin_dates))

        # 1. Calculate best streak (longest consecutive days in history)
        best_streak = 0
        running_streak = 0
        prev_date = None

        for d in sorted_dates:
            if prev_date is None:
                running_streak = 1
            elif d == prev_date + timedelta(days=1):
                running_streak += 1
            elif d == prev_date:
                pass  # duplicate date guard
            else:
                running_streak = 1
            if running_streak > best_streak:
                best_streak = running_streak
            prev_date = d

        # 2. Calculate current streak (consecutive ending today or yesterday)
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)

        current_streak = 0
        if today in checkin_dates:
            scan_date = today
        elif yesterday in checkin_dates:
            scan_date = yesterday
        else:
            scan_date = None

        if scan_date:
            while scan_date in checkin_dates:
                current_streak += 1
                scan_date -= timedelta(days=1)

        return current_streak, best_streak


class CheckIn(models.Model):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='check_ins', db_index=True)
    date = models.DateField(db_index=True)
    note = models.CharField(max_length=280, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'check_ins'
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(fields=['habit', 'date'], name='unique_habit_checkin_per_day')
        ]
        indexes = [
            models.Index(fields=['habit', 'date'], name='checkin_habit_date_idx'),
            models.Index(fields=['date'], name='checkin_date_idx'),
        ]

    def __str__(self):
        return f"{self.habit.name} - {self.date}"
