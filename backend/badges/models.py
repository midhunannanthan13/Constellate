from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


BADGE_DEFINITIONS = [
    {
        'badge_type': 'first_star',
        'name': 'First Star',
        'description': "Your very first check-in lit a star in your personal night sky.",
        'hint': 'Requires your first ever check-in on any habit.',
        'colour': '#FFD76A',
        'icon': '★',
    },
    {
        'badge_type': 'seven_nights',
        'name': 'Seven Nights',
        'description': "Seven consecutive nights of dedication formed a glowing constellation.",
        'hint': 'Requires a 7-day check-in streak on any habit.',
        'colour': '#3EE6C3',
        'icon': '✦',
    },
    {
        'badge_type': 'twenty_one_nights',
        'name': 'Twenty-One Nights',
        'description': "Three full weeks of unbroken starlight — a true celestial rhythm.",
        'hint': 'Requires a 21-day check-in streak on any habit.',
        'colour': '#8B7CFF',
        'icon': '❖',
    },
    {
        'badge_type': 'full_week',
        'name': 'Full Week',
        'description': "Every active habit in your sky met its weekly goal over the last 7 days.",
        'hint': 'Requires all active habits to meet their days-per-week goal in the last 7 days.',
        'colour': '#FF7AC6',
        'icon': '✨',
    },
]

BADGE_MAP = {b['badge_type']: b for b in BADGE_DEFINITIONS}


class Badge(models.Model):
    BADGE_CHOICES = [
        (b['badge_type'], b['name']) for b in BADGE_DEFINITIONS
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='badges',
        db_index=True,
    )
    badge_type = models.CharField(
        max_length=32,
        choices=BADGE_CHOICES,
        db_index=True,
    )
    earned_at = models.DateField(default=timezone.localdate)
    seen = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'badges'
        ordering = ['created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'badge_type'],
                name='unique_user_badge_type',
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.badge_type}"
