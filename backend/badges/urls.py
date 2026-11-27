from django.urls import path
from .views import BadgeListView, MarkBadgesSeenView

urlpatterns = [
    path('', BadgeListView.as_view(), name='badges-list'),
    path('seen/', MarkBadgesSeenView.as_view(), name='badges-mark-seen'),
]
