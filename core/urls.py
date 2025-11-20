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
from .payment_views import (
    CampaignListView as PaymentCampaignListView, 
    CampaignDetailView as PaymentCampaignDetailView,
    OrganizationListView as PaymentOrganizationListView, 
    OrganizationDetailView as PaymentOrganizationDetailView,
    CreateCheckoutSessionView, StripeWebhookView, CheckoutSuccessView
)
from .campaign_views import (
    OrganizationCreateView, OrganizationUpdateView,
    CampaignCreateView, CampaignUpdateView,
    CampaignProgressView, CampaignStatsView,
)
from .volunteer_views import (
    VolunteerOpportunityListView, VolunteerOpportunityDetailView,
    VolunteerOpportunityCreateView, VolunteerOpportunityUpdateView,
    VolunteerOpportunityDeleteView, VolunteerApplicationCreateView,
    VolunteerApplicationListView, VolunteerApplicationDetailView
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
    
    # User Donations
    path('auth/donations', DonationHistoryView.as_view(), name='donation_history'),
    path('auth/recurring-donations', RecurringDonationsView.as_view(), name='recurring_donations'),
    
    # Public - Campaigns & Organizations
    path('campaigns', PaymentCampaignListView.as_view(), name='campaign_list'),
    path('campaigns/<int:pk>', PaymentCampaignDetailView.as_view(), name='campaign_detail'),
    path('campaigns/<slug:slug>/progress', CampaignProgressView.as_view(), name='campaign_progress'),
    path('campaigns/<slug:slug>/stats', CampaignStatsView.as_view(), name='campaign_stats'),
    path('organizations', PaymentOrganizationListView.as_view(), name='organization_list'),
    path('organizations/<int:pk>', PaymentOrganizationDetailView.as_view(), name='organization_detail'),
    
    # Campaign & Organization Management (Admin)
    path('campaigns/create', CampaignCreateView.as_view(), name='campaign_create'),
    path('campaigns/<slug:slug>/update', CampaignUpdateView.as_view(), name='campaign_update'),
    path('organizations/create', OrganizationCreateView.as_view(), name='organization_create'),
    path('organizations/<slug:slug>/update', OrganizationUpdateView.as_view(), name='organization_update'),
    
    # Donations & Payments
    path('donations/checkout', CreateCheckoutSessionView.as_view(), name='create_checkout'),
    path('donations/checkout/success', CheckoutSuccessView.as_view(), name='checkout_success'),
    path('donations/webhook', StripeWebhookView.as_view(), name='stripe_webhook'),
    
    # Volunteer Opportunities (Public)
    path('volunteers/opportunities', VolunteerOpportunityListView.as_view(), name='volunteer_opportunities'),
    path('volunteers/opportunities/<slug:slug>', VolunteerOpportunityDetailView.as_view(), name='volunteer_opportunity_detail'),
    path('volunteers/apply', VolunteerApplicationCreateView.as_view(), name='volunteer_apply'),
    
    # Volunteer Management (Admin)
    path('volunteers/opportunities/create', VolunteerOpportunityCreateView.as_view(), name='volunteer_opportunity_create'),
    path('volunteers/opportunities/<slug:slug>/update', VolunteerOpportunityUpdateView.as_view(), name='volunteer_opportunity_update'),
    path('volunteers/opportunities/<slug:slug>/delete', VolunteerOpportunityDeleteView.as_view(), name='volunteer_opportunity_delete'),
    path('volunteers/applications', VolunteerApplicationListView.as_view(), name='volunteer_applications'),
    path('volunteers/applications/<int:pk>', VolunteerApplicationDetailView.as_view(), name='volunteer_application_detail'),
]
