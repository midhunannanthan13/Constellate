from datetime import timedelta
from django.db import IntegrityError, transaction
from django.utils import timezone
from habits.models import Habit, CheckIn
from .models import Badge, BADGE_MAP


def _award_badge_safe(user, badge_type):
    """
    Safely awards a badge without ever creating duplicates, even under
    concurrent requests, using atomic savepoint + IntegrityError guard.
    Returns the badge metadata dict if newly awarded, otherwise None.
    """
    if Badge.objects.filter(user=user, badge_type=badge_type).exists():
        return None

    try:
        with transaction.atomic():
            badge, created = Badge.objects.get_or_create(
                user=user,
                badge_type=badge_type,
                defaults={
                    'earned_at': timezone.localdate(),
                    'seen': False,
                },
            )
            if created:
                meta = BADGE_MAP[badge_type]
                return {
                    'badge_type': badge_type,
                    'name': meta['name'],
                    'description': meta['description'],
                    'colour': meta['colour'],
                    'icon': meta['icon'],
                    'date_earned': badge.earned_at.strftime('%Y-%m-%d'),
                    'is_new': True,
                }
    except IntegrityError:
        # Concurrent request already inserted the unique (user, badge_type) row
        return None
    return None


def evaluate_and_award_badges(user):
    """
    Evaluates all 4 badge criteria for `user` and awards any newly earned badges.
    Never removes existing badges even if check-ins are later un-checked.
    Returns a list of newly awarded badge dicts.
    """
    newly_awarded = []
    already_earned = set(
        Badge.objects.filter(user=user).values_list('badge_type', flat=True)
    )

    # 1. First Star: user's first ever check-in
    if 'first_star' not in already_earned:
        if CheckIn.objects.filter(habit__user=user).exists():
            awarded = _award_badge_safe(user, 'first_star')
            if awarded:
                newly_awarded.append(awarded)

    # Load all user habits (including archived for historical streaks) and active habits
    all_habits = list(Habit.objects.filter(user=user))
    active_habits = [h for h in all_habits if not h.archived]

    # 2 & 3. Seven Nights (7-day streak) and Twenty-One Nights (21-day streak)
    need_7 = 'seven_nights' not in already_earned
    need_21 = 'twenty_one_nights' not in already_earned

    if (need_7 or need_21) and all_habits:
        max_streak = 0
        for h in all_habits:
            curr_s, best_s = h.calculate_streaks()
            max_streak = max(max_streak, curr_s, best_s)

        if need_7 and max_streak >= 7:
            awarded = _award_badge_safe(user, 'seven_nights')
            if awarded:
                newly_awarded.append(awarded)

        if need_21 and max_streak >= 21:
            awarded = _award_badge_safe(user, 'twenty_one_nights')
            if awarded:
                newly_awarded.append(awarded)

    # 4. Full Week: in the last 7 days (ending today), every active habit
    #    has met its days_per_week_goal, and user has at least one active habit.
    if 'full_week' not in already_earned and active_habits:
        today = timezone.localdate()
        seven_days_ago = today - timedelta(days=6)

        all_met = True
        for h in active_habits:
            week_count = CheckIn.objects.filter(
                habit=h,
                date__gte=seven_days_ago,
                date__lte=today,
            ).count()
            if week_count < h.days_per_week_goal:
                all_met = False
                break

        if all_met:
            awarded = _award_badge_safe(user, 'full_week')
            if awarded:
                newly_awarded.append(awarded)

    return newly_awarded
