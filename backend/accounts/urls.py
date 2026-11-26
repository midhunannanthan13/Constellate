from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SignUpView, SignInView, UserProfileView

urlpatterns = [
    path('signup/', SignUpView.as_view(), name='auth-signup'),
    path('register/', SignUpView.as_view(), name='auth-register'), # alias
    path('signin/', SignInView.as_view(), name='auth-signin'),
    path('login/', SignInView.as_view(), name='auth-login'),       # alias
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', UserProfileView.as_view(), name='auth-profile'),
    path('me/', UserProfileView.as_view(), name='auth-me'),         # alias
]
