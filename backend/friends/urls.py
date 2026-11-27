from django.urls import path
from .views import (
    FriendsOverviewView,
    SendFriendRequestView,
    AcceptFriendRequestView,
    DeclineFriendRequestView,
    RemoveFriendView,
    FriendSkyView,
)

urlpatterns = [
    path('', FriendsOverviewView.as_view(), name='friends-overview'),
    path('request/', SendFriendRequestView.as_view(), name='friends-send-request'),
    path('requests/<int:pk>/accept/', AcceptFriendRequestView.as_view(), name='friends-accept-request'),
    path('requests/<int:pk>/decline/', DeclineFriendRequestView.as_view(), name='friends-decline-request'),
    path('<int:pk>/', RemoveFriendView.as_view(), name='friends-remove'),
    path('<int:friend_id>/sky/', FriendSkyView.as_view(), name='friends-sky'),
]
