import secrets
import string
from django.db import models
from django.contrib.auth.models import User

def generate_friend_code():
    """Generates a memorable unique friend code (e.g. STAR-7N3KP9)."""
    chars = ''.join(c for c in string.ascii_uppercase + string.digits if c not in '01IO')
    suffix = ''.join(secrets.choice(chars) for _ in range(6))
    return f"STAR-{suffix}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    friend_code = models.CharField(
        max_length=16,
        unique=True,
        db_index=True,
        help_text="Unique celestial friend code for sharing skies"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} ({self.friend_code})"

    @classmethod
    def create_for_user(cls, user):
        """Creates a Profile for the user ensuring the friend code is unique."""
        for _ in range(10):
            code = generate_friend_code()
            if not cls.objects.filter(friend_code=code).exists():
                return cls.objects.create(user=user, friend_code=code)
        # Fallback if extremely high collision
        suffix = secrets.token_hex(4).upper()
        return cls.objects.create(user=user, friend_code=f"STAR-{suffix}")
