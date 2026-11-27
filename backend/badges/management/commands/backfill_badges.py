from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from badges.services import evaluate_and_award_badges


class Command(BaseCommand):
    help = 'Backfills earned badges for all existing users based on their check-in history.'

    def handle(self, *args, **options):
        users = User.objects.all().order_by('id')
        total_awarded = 0

        for user in users:
            awarded = evaluate_and_award_badges(user)
            if awarded:
                names = ', '.join(b['name'] for b in awarded)
                self.stdout.write(
                    self.style.SUCCESS(f"Awarded to {user.username}: {names}")
                )
                total_awarded += len(awarded)
            else:
                self.stdout.write(f"No new badges for {user.username}")

        self.stdout.write(
            self.style.SUCCESS(f"Backfill complete. Total badges awarded: {total_awarded}")
        )
