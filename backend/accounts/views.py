from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import SignUpSerializer, SignInSerializer, UserProfileSerializer

def get_tokens_for_user(user):
    """Generates SimpleJWT access and refresh tokens for the given user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class SignUpView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SignUpSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors, "message": "Please correct the errors below."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        tokens = get_tokens_for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response(
            {
                "message": "Welcome to Constellate! Your celestial sky is ready.",
                "tokens": tokens,
                "user": user_data
            },
            status=status.HTTP_201_CREATED
        )

class SignInView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        if not serializer.is_valid():
            # Extract clean friendly error message
            non_field_errors = serializer.errors.get('non_field_errors')
            err_msg = non_field_errors[0] if non_field_errors else "Invalid credentials provided."
            return Response(
                {"errors": serializer.errors, "message": err_msg},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        user_data = UserProfileSerializer(user).data

        return Response(
            {
                "message": f"Welcome back, {user.username}!",
                "tokens": tokens,
                "user": user_data
            },
            status=status.HTTP_200_OK
        )

class UserProfileView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        # Ensure profile exists if user was created earlier
        if not hasattr(user, 'profile'):
            from .models import Profile
            Profile.create_for_user(user)
            user.refresh_from_db()

        serializer = UserProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
