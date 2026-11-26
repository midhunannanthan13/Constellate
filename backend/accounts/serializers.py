from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from .models import Profile

class UserProfileSerializer(serializers.ModelSerializer):
    friend_code = serializers.CharField(source='profile.friend_code', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'friend_code', 'date_joined')
        read_only_fields = ('id', 'friend_code', 'date_joined')

class SignUpSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3, trim_whitespace=True)
    email = serializers.EmailField(max_length=254, trim_whitespace=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken. Please choose another celestial name.")
        if not value.isalnum() and not all(c in "-_." or c.isalnum() for c in value):
            raise serializers.ValidationError("Username may only contain letters, numbers, and - _ . characters.")
        return value

    def validate_email(self, value):
        clean_email = value.lower()
        if User.objects.filter(email__iexact=clean_email).exists():
            raise serializers.ValidationError("An account with this email already exists. Try signing in instead.")
        return clean_email

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match. Please re-enter both."})

        # Validate password using Django's built-in validators
        temp_user = User(username=data.get('username'), email=data.get('email'))
        try:
            validate_password(password, user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})

        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        # Ensure profile exists (post_save signal creates it, but ensure safety)
        if not hasattr(user, 'profile'):
            Profile.create_for_user(user)
        return user

class SignInSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, trim_whitespace=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        username_or_email = data.get('username')
        password = data.get('password')

        if not username_or_email or not password:
            raise serializers.ValidationError("Both username/email and password are required.")

        # Support sign-in with either email or username
        user = None
        if '@' in username_or_email:
            try:
                matched_user = User.objects.get(email__iexact=username_or_email)
                user = authenticate(username=matched_user.username, password=password)
            except (User.DoesNotExist, User.MultipleObjectsReturned):
                user = None
        else:
            user = authenticate(username=username_or_email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid username or password. Please verify your credentials.")

        if not user.is_active:
            raise serializers.ValidationError("This account is currently disabled.")

        # Ensure profile exists
        if not hasattr(user, 'profile'):
            Profile.create_for_user(user)

        data['user'] = user
        return data
