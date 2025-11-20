"""
URL configuration for core API endpoints
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, LogoutView, CurrentUserView,
    UpdateProfileView, ChangePasswordView,
    PasswordResetRequestView, PasswordResetConfirmView,
    DonationHistoryView, RecurringDonationsView
)

app_name = 'core'

urlpatterns = [
    # Authentication
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/login', LoginView.as_view(), name='login'),
    path('auth/logout', LogoutView.as_view(), name='logout'),
    path('auth/token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('auth/me', CurrentUserView.as_view(), name='current_user'),
    path('auth/profile', UpdateProfileView.as_view(), name='update_profile'),
    
    # Password Management
    path('auth/change-password', ChangePasswordView.as_view(), name='change_password'),
    path('auth/password-reset', PasswordResetRequestView.as_view(), name='password_reset'),
    path('auth/password-reset-confirm', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Donations
    path('auth/donations', DonationHistoryView.as_view(), name='donation_history'),
    path('auth/recurring-donations', RecurringDonationsView.as_view(), name='recurring_donations'),
]
