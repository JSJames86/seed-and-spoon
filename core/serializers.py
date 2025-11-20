"""
Serializers for authentication and user management
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from core.models import DonorProfile


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class DonorProfileSerializer(serializers.ModelSerializer):
    """Donor profile serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = DonorProfile
        fields = [
            'id', 'user', 'phone', 'preferred_communication', 'email_opt_in', 
            'sms_opt_in', 'donor_type', 'company_name', 'address_line1', 
            'address_line2', 'city', 'state', 'zip_code', 'country',
            'total_donated', 'donation_count', 'first_donation_date', 
            'last_donation_date', 'average_donation', 'lifecycle_status',
            'engagement_score', 'tags', 'source_channel'
        ]
        read_only_fields = [
            'id', 'total_donated', 'donation_count', 'first_donation_date',
            'last_donation_date', 'average_donation', 'lifecycle_status',
            'engagement_score'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    """User registration serializer"""
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    email = serializers.EmailField(required=True)
    
    # Optional donor profile fields
    phone = serializers.CharField(required=False, allow_blank=True)
    preferred_communication = serializers.ChoiceField(
        choices=DonorProfile.COMMUNICATION_PREFERENCES,
        default='email',
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'phone', 'preferred_communication'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate_email(self, value):
        """Check if email is already registered"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        """Create user and donor profile"""
        # Remove password_confirm and profile fields
        validated_data.pop('password_confirm')
        phone = validated_data.pop('phone', '')
        preferred_communication = validated_data.pop('preferred_communication', 'email')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        
        # Create donor profile
        DonorProfile.objects.create(
            user=user,
            phone=phone,
            preferred_communication=preferred_communication,
            source_channel='web'
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    """User login serializer"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )


class ChangePasswordSerializer(serializers.Serializer):
    """Change password serializer"""
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords don't match."})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Password reset request serializer"""
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Password reset confirmation serializer"""
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, attrs):
        """Validate new password confirmation"""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords don't match."})
        return attrs


class UpdateProfileSerializer(serializers.ModelSerializer):
    """Update user profile serializer"""
    first_name = serializers.CharField(source='user.first_name', required=False)
    last_name = serializers.CharField(source='user.last_name', required=False)
    email = serializers.EmailField(source='user.email', required=False)
    
    class Meta:
        model = DonorProfile
        fields = [
            'first_name', 'last_name', 'email', 'phone', 
            'preferred_communication', 'email_opt_in', 'sms_opt_in',
            'address_line1', 'address_line2', 'city', 'state', 
            'zip_code', 'country'
        ]
    
    def validate_email(self, value):
        """Check if email is already taken by another user"""
        user = self.context['request'].user
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def update(self, instance, validated_data):
        """Update both User and DonorProfile"""
        user_data = validated_data.pop('user', {})
        
        # Update User fields
        user = instance.user
        for attr, value in user_data.items():
            setattr(user, attr, value)
        user.save()
        
        # Update DonorProfile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        return instance
