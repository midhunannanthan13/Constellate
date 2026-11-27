from datetime import timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.models import Q
from django.utils import timezone

from accounts.models import Profile
from habits.models import Habit, CheckIn
from friends.models import Friendship
from badges.services import evaluate_and_award_badges


class Command(BaseCommand):
    help = (
        "Seeds realistic demo data (stargazer_demo and luna_friend) "
        "without touching real user accounts. Safe to run multiple times."
    )

    def _get_or_create_demo_user(self, username, first_name, email, password):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "first_name": first_name,
                "email": email,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo user: {username}"))
        else:
            self.stdout.write(f"Demo user '{username}' already exists (skipping user creation).")

        if not hasattr(user, "profile"):
            Profile.create_for_user(user)
        return user

    def _seed_habit_checkins(self, habit, offsets_with_notes):
        today = timezone.localdate()
        created_count = 0
        for days_ago, note in offsets_with_notes:
            target_date = today - timedelta(days=days_ago)
            _, created = CheckIn.objects.get_or_create(
                habit=habit,
                date=target_date,
                defaults={"note": note},
            )
            if created:
                created_count += 1
        return created_count

    def handle(self, *args, **options):
        demo_password = "constellate123"

        # 1. Primary Demo Account
        demo_user = self._get_or_create_demo_user(
            username="stargazer_demo",
            first_name="Nova Stargazer",
            email="stargazer_demo@example.com",
            password=demo_password,
        )

        # Four habits with varied Aurora colours and goals across ~6 weeks (42 days)
        habit_specs = [
            {
                "name": "Morning Reading",
                "colour": "#FFD76A",  # Star Gold
                "days_per_week_goal": 7,
                # Completed 9-day streak ending today + 5 weeks of rich history with small gaps
                "offsets": (
                    [(d, "Morning chapter before sunrise") for d in range(0, 9)]
                    + [(d, "Quiet morning pages") for d in range(11, 18)]
                    + [(d, "Weekend reading") for d in range(20, 26)]
                    + [(d, "Consistent start") for d in range(28, 35)]
                    + [(d, "First week spark") for d in range(37, 42)]
                ),
            },
            {
                "name": "Evening Meditation",
                "colour": "#3EE6C3",  # Aurora Teal
                "days_per_week_goal": 5,
                # 4-day streak ending today + earlier 10-day streak
                "offsets": (
                    [(d, "Calm breathing under the stars") for d in range(0, 4)]
                    + [(d, "Evening stillness") for d in range(6, 11)]
                    + [(d, "Deep focus session") for d in range(14, 24)]
                    + [(d, "Mindful reset") for d in range(27, 32)]
                    + [(d, "Quiet mind") for d in range(35, 40)]
                ),
            },
            {
                "name": "Deep Work Coding",
                "colour": "#8B7CFF",  # Aurora Violet
                "days_per_week_goal": 5,
                # Weekday coding cadence over 6 weeks
                "offsets": [
                    (d, "Focused build block")
                    for d in range(0, 42)
                    if d % 7 not in (2, 5)
                ],
            },
            {
                "name": "Stargazing Walk",
                "colour": "#FF7AC6",  # Aurora Pink
                "days_per_week_goal": 3,
                # 3x/week evening walks including today
                "offsets": [
                    (d, "Night sky walk")
                    for d in [0, 2, 5, 7, 10, 13, 15, 18, 21, 24, 27, 30, 33, 36, 39, 41]
                ],
            },
        ]

        total_new_checkins = 0
        for spec in habit_specs:
            habit, _ = Habit.objects.get_or_create(
                user=demo_user,
                name=spec["name"],
                defaults={
                    "colour": spec["colour"],
                    "days_per_week_goal": spec["days_per_week_goal"],
                    "archived": False,
                },
            )
            total_new_checkins += self._seed_habit_checkins(habit, spec["offsets"])

        # Award badges via the standard badge service
        demo_badges = evaluate_and_award_badges(demo_user)

        # 2. Second Demo Account (Accepted Friend)
        friend_user = self._get_or_create_demo_user(
            username="luna_friend",
            first_name="Luna",
            email="luna_friend@example.com",
            password=demo_password,
        )

        friend_habit_specs = [
            {
                "name": "Sketchbook",
                "colour": "#3EE6C3",
                "days_per_week_goal": 6,
                "offsets": [(d, "Night sketch") for d in range(0, 8)] + [(d, "Study") for d in range(10, 16)],
            },
            {
                "name": "Guitar Practice",
                "colour": "#FFD76A",
                "days_per_week_goal": 4,
                "offsets": [(d, "Chords & scales") for d in [0, 1, 3, 6, 8, 11, 14, 17, 20]],
            },
            {
                "name": "Tea & Quiet",
                "colour": "#8B7CFF",
                "days_per_week_goal": 5,
                "offsets": [(d, "Chamomile wind-down") for d in range(1, 6)] + [(d, "Rest") for d in range(9, 14)],
            },
        ]

        for spec in friend_habit_specs:
            habit, _ = Habit.objects.get_or_create(
                user=friend_user,
                name=spec["name"],
                defaults={
                    "colour": spec["colour"],
                    "days_per_week_goal": spec["days_per_week_goal"],
                    "archived": False,
                },
            )
            total_new_checkins += self._seed_habit_checkins(habit, spec["offsets"])

        evaluate_and_award_badges(friend_user)

        # 3. Accepted Friendship between stargazer_demo and luna_friend (idempotent)
        existing_friendship = Friendship.objects.filter(
            Q(requester=demo_user, receiver=friend_user)
            | Q(requester=friend_user, receiver=demo_user)
        ).first()

        if not existing_friendship:
            Friendship.objects.create(
                requester=demo_user,
                receiver=friend_user,
                status=Friendship.STATUS_ACCEPTED,
            )
            self.stdout.write(self.style.SUCCESS("Created accepted friendship: stargazer_demo <-> luna_friend"))
        elif existing_friendship.status != Friendship.STATUS_ACCEPTED:
            existing_friendship.status = Friendship.STATUS_ACCEPTED
            existing_friendship.save()

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo seed complete! New check-ins added: {total_new_checkins}. "
                f"New badges awarded to stargazer_demo: {len(demo_badges)}."
            )
        )
