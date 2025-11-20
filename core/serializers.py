"""
Serializers for authentication and user management
"""
from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from core.models import (
    DonorProfile, Organization, Campaign, Donation, RecurringDonation,
    VolunteerOpportunity, VolunteerApplication
)


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


class OrganizationSerializer(serializers.ModelSerializer):
    """Organization serializer for public display"""
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'mission_statement',
            'email', 'phone', 'website', 'logo',
            'address_line1', 'address_line2', 'city', 'state', 'zip_code',
            'ein', 'tax_exempt_status',
            'facebook_url', 'twitter_url', 'instagram_url',
            'primary_color', 'is_featured', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at']


class CampaignSerializer(serializers.ModelSerializer):
    """Campaign serializer with organization details"""
    organization = OrganizationSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'title', 'slug', 'description', 'campaign_type',
            'goal_amount', 'amount_raised', 'donor_count',
            'start_date', 'end_date', 'status',
            'is_matching', 'matching_amount', 'matching_sponsor',
            'impact_metric_label', 'impact_metric_value', 'impact_metric_amount',
            'featured_image', 'is_featured',
            'organization', 'progress_percentage', 'days_remaining',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'amount_raised', 'donor_count', 'created_at', 'updated_at']
    
    def get_progress_percentage(self, obj):
        """Calculate campaign progress percentage"""
        if obj.goal_amount > 0:
            return min(100, int((obj.amount_raised / obj.goal_amount) * 100))
        return 0
    
    def get_days_remaining(self, obj):
        """Calculate days remaining in campaign"""
        if obj.end_date:
            from django.utils import timezone
            delta = obj.end_date - timezone.now()
            return max(0, delta.days)
        return None


class DonationSerializer(serializers.ModelSerializer):
    """Donation serializer for listing donations"""
    campaign_name = serializers.CharField(source='campaign.title', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Donation
        fields = [
            'id', 'amount', 'currency', 'donation_type',
            'campaign_name', 'organization_name',
            'status', 'is_anonymous', 'created_at', 'completed_at'
        ]
        read_only_fields = fields


class RecurringDonationSerializer(serializers.ModelSerializer):
    """Recurring donation serializer"""
    campaign_name = serializers.CharField(source='campaign.title', read_only=True, allow_null=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = RecurringDonation
        fields = [
            'id', 'amount', 'currency', 'frequency',
            'campaign_name', 'organization_name',
            'status', 'total_payments', 'successful_payments', 'failed_payments',
            'start_date', 'next_payment_date', 'created_at'
        ]
        read_only_fields = fields


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Detailed organization serializer with all fields"""
    class Meta:
        model = Organization
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignDetailSerializer(serializers.ModelSerializer):
    """Detailed campaign serializer with organization info"""
    organization = OrganizationSerializer(read_only=True)
    
    class Meta:
        model = Campaign
        fields = '__all__'
        read_only_fields = ['id', 'amount_raised', 'donor_count', 'created_at', 'updated_at']


class VolunteerOpportunitySerializer(serializers.ModelSerializer):
    """Volunteer opportunity serializer for public listing"""
    
    class Meta:
        model = VolunteerOpportunity
        fields = [
            'id', 'title', 'emoji', 'slug', 'category', 'schedule', 
            'duties', 'ideal_for', 'summary', 'days_available', 
            'is_paid', 'sort_order'
        ]


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    """Volunteer application serializer"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = VolunteerApplication
        fields = [
            'id', 'user', 'full_name', 'email', 'phone', 'preferred_contact',
            'roles', 'availability', 'resume', 'linkedin', 'accessibility_notes',
            'transportation', 'message', 'orientation_agreed', 'photo_consent',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']


class VolunteerApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating volunteer applications"""
    
    class Meta:
        model = VolunteerApplication
        fields = [
            'full_name', 'email', 'phone', 'preferred_contact',
            'roles', 'availability', 'resume', 'linkedin', 'accessibility_notes',
            'transportation', 'message', 'orientation_agreed', 'photo_consent'
        ]
    
    def create(self, validated_data):
        # Associate with current user if authenticated
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)
