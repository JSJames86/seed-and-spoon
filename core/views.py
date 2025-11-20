"""
API views for authentication and user management
"""
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

from .serializers import (
    RegisterSerializer, LoginSerializer, UserSerializer,
    DonorProfileSerializer, ChangePasswordSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    UpdateProfileSerializer
)
from .models import DonorProfile


class RegisterView(generics.CreateAPIView):
    """
    User registration endpoint
    POST /api/auth/register
    """
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get donor profile
        donor_profile = DonorProfile.objects.get(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': DonorProfileSerializer(donor_profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'Registration successful. Welcome to Seed & Spoon!'
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    User login endpoint
    POST /api/auth/login
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # Authenticate user
        user = authenticate(username=username, password=password)
        
        if user is None:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        if not user.is_active:
            return Response({
                'error': 'Account is inactive'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Get or create donor profile
        donor_profile, created = DonorProfile.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': DonorProfileSerializer(donor_profile).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })


class LogoutView(APIView):
    """
    User logout endpoint
    POST /api/auth/logout
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({
                'message': 'Successfully logged out'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    """
    Get current authenticated user
    GET /api/auth/me
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        donor_profile = DonorProfile.objects.filter(user=user).first()
        
        if not donor_profile:
            donor_profile = DonorProfile.objects.create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'profile': DonorProfileSerializer(donor_profile).data
        })


class UpdateProfileView(generics.UpdateAPIView):
    """
    Update user profile
    PUT/PATCH /api/auth/profile
    """
    serializer_class = UpdateProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        donor_profile, created = DonorProfile.objects.get_or_create(user=self.request.user)
        return donor_profile


class ChangePasswordView(APIView):
    """
    Change password for authenticated user
    POST /api/auth/change-password
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'error': 'Incorrect old password'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        })


class PasswordResetRequestView(APIView):
    """
    Request password reset
    POST /api/auth/password-reset
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Build reset URL
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            
            # Send email
            send_mail(
                subject='Password Reset Request - Seed & Spoon',
                message=f'''
Hello {user.first_name or user.username},

You requested a password reset for your Seed & Spoon account.

Click the link below to reset your password:
{reset_url}

This link will expire in 24 hours.

If you didn't request this, please ignore this email.

Best regards,
Seed & Spoon Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
        except User.DoesNotExist:
            # Don't reveal if user exists
            pass
        
        return Response({
            'message': 'If an account exists with that email, a password reset link has been sent.'
        })


class PasswordResetConfirmView(APIView):
    """
    Confirm password reset
    POST /api/auth/password-reset-confirm
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            uid = request.data.get('uid')
            token = serializer.validated_data['token']
            
            # Decode user ID
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
            
            # Verify token
            if not default_token_generator.check_token(user, token):
                return Response({
                    'error': 'Invalid or expired reset link'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password has been reset successfully'
            })
            
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)


class DonationHistoryView(APIView):
    """
    Get user's donation history
    GET /api/auth/donations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from .models import Donation
        
        try:
            donor_profile = request.user.donor_profile
            donations = Donation.objects.filter(
                donor=donor_profile,
                status='succeeded'
            ).select_related('organization', 'campaign').order_by('-created_at')
            
            data = [{
                'id': donation.id,
                'amount': str(donation.amount),
                'currency': donation.currency,
                'organization': donation.organization.name,
                'campaign': donation.campaign.title if donation.campaign else None,
                'donation_type': donation.donation_type,
                'created_at': donation.created_at,
                'is_anonymous': donation.is_anonymous,
            } for donation in donations]
            
            return Response({
                'donations': data,
                'total_donated': str(donor_profile.total_donated),
                'donation_count': donor_profile.donation_count
            })
            
        except DonorProfile.DoesNotExist:
            return Response({
                'donations': [],
                'total_donated': '0.00',
                'donation_count': 0
            })


class RecurringDonationsView(APIView):
    """
    Get user's recurring donations
    GET /api/auth/recurring-donations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from .models import RecurringDonation
        
        try:
            donor_profile = request.user.donor_profile
            recurring = RecurringDonation.objects.filter(
                donor=donor_profile
            ).select_related('organization', 'campaign').order_by('-created_at')
            
            data = [{
                'id': recurring_donation.id,
                'amount': str(recurring_donation.amount),
                'currency': recurring_donation.currency,
                'frequency': recurring_donation.frequency,
                'organization': recurring_donation.organization.name,
                'campaign': recurring_donation.campaign.title if recurring_donation.campaign else None,
                'status': recurring_donation.status,
                'next_payment_date': recurring_donation.next_payment_date,
                'successful_payments': recurring_donation.successful_payments,
            } for recurring_donation in recurring]
            
            return Response({'recurring_donations': data})
            
        except DonorProfile.DoesNotExist:
            return Response({'recurring_donations': []})
