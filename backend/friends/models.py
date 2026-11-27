from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Friendship(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_ACCEPTED = 'accepted'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_ACCEPTED, 'Accepted'),
    ]

    requester = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_friendships',
        db_index=True,
    )
    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_friendships',
        db_index=True,
    )
    status = models.CharField(
        max_length=16,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'friendships'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['requester', 'receiver'],
                name='unique_friendship_pair',
            ),
            models.CheckConstraint(
                condition=~models.Q(requester=models.F('receiver')),
                name='prevent_self_friendship',
            ),
        ]
        indexes = [
            models.Index(fields=['requester', 'status'], name='friend_req_status_idx'),
            models.Index(fields=['receiver', 'status'], name='friend_rec_status_idx'),
        ]

    def clean(self):
        if self.requester_id == self.receiver_id:
            raise ValidationError("You cannot send a friend request to yourself.")

        # Prevent reverse duplicate (B -> A when A -> B already exists)
        reverse_exists = Friendship.objects.filter(
            requester_id=self.receiver_id,
            receiver_id=self.requester_id,
        ).exclude(pk=self.pk).exists()
        if reverse_exists:
            raise ValidationError("A friendship or pending request already exists between these two users.")

    def __str__(self):
        return f"{self.requester.username} -> {self.receiver.username} ({self.status})"
