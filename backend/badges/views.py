from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Badge, BADGE_DEFINITIONS


class BadgeListView(APIView):
    """
    Returns all 4 badges for the signed-in user with earned status,
    date earned, description, hint, and whether it is newly earned (unseen).
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_badges = {
            b.badge_type: b for b in Badge.objects.filter(user=request.user)
        }

        result = []
        for meta in BADGE_DEFINITIONS:
            b_type = meta['badge_type']
            earned_obj = user_badges.get(b_type)
            result.append({
                'badge_type': b_type,
                'name': meta['name'],
                'description': meta['description'],
                'hint': meta['hint'],
                'colour': meta['colour'],
                'icon': meta['icon'],
                'earned': earned_obj is not None,
                'date_earned': earned_obj.earned_at.strftime('%Y-%m-%d') if earned_obj else None,
                'is_new': (earned_obj is not None and not earned_obj.seen),
            })

        return Response({
            'badges': result,
            'earned_count': len(user_badges),
            'total_count': len(BADGE_DEFINITIONS),
        }, status=status.HTTP_200_OK)


class MarkBadgesSeenView(APIView):
    """Marks earned unseen badges for the signed-in user as seen."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        badge_types = request.data.get('badge_types')
        qs = Badge.objects.filter(user=request.user, seen=False)
        if isinstance(badge_types, list) and badge_types:
            qs = qs.filter(badge_type__in=badge_types)

        updated = qs.update(seen=True)
        return Response({
            'message': 'Badges marked as seen.',
            'marked_count': updated,
        }, status=status.HTTP_200_OK)
