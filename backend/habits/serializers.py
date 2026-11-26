from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Habit, CheckIn, AURORA_COLORS

class CheckInSerializer(serializers.ModelSerializer):
    class Meta:
        model = CheckIn
        fields = ('id', 'habit', 'date', 'note', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_date(self, value):
        today = timezone.localdate()
        if value > today:
            raise serializers.ValidationError(
                f"Cannot check in for future date {value}. Today is {today}."
            )
        return value

class HabitSerializer(serializers.ModelSerializer):
    current_streak = serializers.SerializerMethodField()
    best_streak = serializers.SerializerMethodField()
    total_checkins = serializers.SerializerMethodField()
    is_checked_today = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = (
            'id',
            'name',
            'colour',
            'days_per_week_goal',
            'archived',
            'created_at',
            'updated_at',
            'current_streak',
            'best_streak',
            'total_checkins',
            'is_checked_today',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'current_streak', 'best_streak', 'total_checkins', 'is_checked_today')

    def get_current_streak(self, obj):
        current, _ = obj.calculate_streaks()
        return current

    def get_best_streak(self, obj):
        _, best = obj.calculate_streaks()
        return best

    def get_total_checkins(self, obj):
        return obj.check_ins.count()

    def get_is_checked_today(self, obj):
        today = timezone.localdate()
        return obj.check_ins.filter(date=today).exists()

    def validate_days_per_week_goal(self, value):
        if value < 1 or value > 7:
            raise serializers.ValidationError("Goal must be between 1 and 7 days per week.")
        return value

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Habit name cannot be empty.")
        return value.strip()

class HabitDetailSerializer(HabitSerializer):
    last_30_days_checkins = serializers.SerializerMethodField()

    class Meta(HabitSerializer.Meta):
        fields = HabitSerializer.Meta.fields + ('last_30_days_checkins',)

    def get_last_30_days_checkins(self, obj):
        today = timezone.localdate()
        start_date = today - timedelta(days=29) # 30 days total including today
        records = obj.check_ins.filter(date__gte=start_date, date__lte=today)
        return CheckInSerializer(records, many=True).data
