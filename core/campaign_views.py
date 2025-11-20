"""
Campaign and Organization Management Views

Provides CRUD operations for organizations and campaigns.
Org admins can manage their campaigns, super-admins can manage everything.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg
from .models import Organization, Campaign
from .serializers import (
    OrganizationSerializer, 
    OrganizationDetailSerializer,
    CampaignSerializer,
    CampaignDetailSerializer
)


class IsOrgAdminOrSuperAdmin(permissions.BasePermission):
    """
    Custom permission: allow org admins to manage their own org,
    super-admins to manage everything
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        # Super-admins can do anything
        if request.user.is_superuser or request.user.is_staff:
            return True
        # For org admins, check in has_object_permission
        return True
    
    def has_object_permission(self, request, view, obj):
        # Super-admins can do anything
        if request.user.is_superuser or request.user.is_staff:
            return True
        # Check if user is admin of this organization
        from .models import OrganizationAdmin
        if hasattr(obj, 'organization'):
            # For campaigns
            org = obj.organization
        else:
            # For organizations
            org = obj
        return OrganizationAdmin.objects.filter(user=request.user, organization=org).exists()


class OrganizationListView(generics.ListAPIView):
    """
    GET /api/organizations/
    List all active organizations (public)
    """
    queryset = Organization.objects.filter(status='active', is_featured=True)
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]


class OrganizationDetailView(generics.RetrieveAPIView):
    """
    GET /api/organizations/<slug>/
    Get organization details by slug (public)
    """
    queryset = Organization.objects.filter(status='active')
    serializer_class = OrganizationDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class OrganizationCreateView(generics.CreateAPIView):
    """
    POST /api/organizations/create/
    Create new organization (super-admin only)
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationDetailSerializer
    permission_classes = [permissions.IsAdminUser]


class OrganizationUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/organizations/<slug>/update/
    Update organization (org admin or super-admin)
    """
    queryset = Organization.objects.all()
    serializer_class = OrganizationDetailSerializer
    lookup_field = 'slug'
    permission_classes = [IsOrgAdminOrSuperAdmin]


class CampaignListView(generics.ListAPIView):
    """
    GET /api/campaigns/
    List active campaigns, optionally filtered by organization
    Query params: ?organization=<slug>&status=<status>
    """
    serializer_class = CampaignSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Campaign.objects.filter(status='active')
        
        # Filter by organization slug
        org_slug = self.request.query_params.get('organization')
        if org_slug:
            queryset = queryset.filter(organization__slug=org_slug)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by campaign type
        campaign_type = self.request.query_params.get('type')
        if campaign_type:
            queryset = queryset.filter(campaign_type=campaign_type)
        
        # Show featured first
        return queryset.order_by('-is_featured', '-created_at')


class CampaignDetailView(generics.RetrieveAPIView):
    """
    GET /api/campaigns/<slug>/
    Get campaign details by slug (public)
    """
    queryset = Campaign.objects.filter(status='active')
    serializer_class = CampaignDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class CampaignCreateView(generics.CreateAPIView):
    """
    POST /api/campaigns/create/
    Create new campaign (org admin or super-admin)
    """
    serializer_class = CampaignDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsOrgAdminOrSuperAdmin]
    
    def perform_create(self, serializer):
        # TODO: Automatically set organization based on user's org admin role
        serializer.save()


class CampaignUpdateView(generics.UpdateAPIView):
    """
    PUT/PATCH /api/campaigns/<slug>/update/
    Update campaign (org admin or super-admin)
    """
    queryset = Campaign.objects.all()
    serializer_class = CampaignDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.IsAuthenticated, IsOrgAdminOrSuperAdmin]


class CampaignProgressView(APIView):
    """
    GET /api/campaigns/<slug>/progress/
    Get campaign progress metrics
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, slug):
        campaign = get_object_or_404(Campaign, slug=slug)
        
        progress_percent = 0
        if campaign.goal_amount > 0:
            progress_percent = (float(campaign.amount_raised) / float(campaign.goal_amount)) * 100
        
        return Response({
            'campaign_id': campaign.id,
            'campaign_name': campaign.title,
            'goal_amount': float(campaign.goal_amount),
            'amount_raised': float(campaign.amount_raised),
            'progress_percent': round(progress_percent, 2),
            'donor_count': campaign.donor_count,
            'is_matching': campaign.is_matching,
            'matching_amount': float(campaign.matching_amount) if campaign.matching_amount else None,
            'matching_sponsor': campaign.matching_sponsor,
            'days_remaining': (campaign.end_date - campaign.start_date).days if campaign.end_date else None,
            'status': campaign.status
        })


class CampaignStatsView(APIView):
    """
    GET /api/campaigns/<slug>/stats/
    Get detailed campaign statistics (org admin or super-admin)
    """
    permission_classes = [permissions.IsAuthenticated, IsOrgAdminOrSuperAdmin]
    
    def get(self, request, slug):
        campaign = get_object_or_404(Campaign, slug=slug)
        
        # Get donations for this campaign
        from .models import Donation
        donations = Donation.objects.filter(campaign=campaign, status='completed')
        
        total_donations = donations.count()
        unique_donors = donations.values('donor').distinct().count()
        avg_donation = donations.aggregate(avg=Avg('amount'))['avg'] or 0
        
        # Recurring vs one-time
        recurring_count = donations.filter(donation_type='recurring').count()
        onetime_count = donations.filter(donation_type='one_time').count()
        
        return Response({
            'campaign_id': campaign.id,
            'total_donations': total_donations,
            'unique_donors': unique_donors,
            'average_donation': float(avg_donation),
            'recurring_donations': recurring_count,
            'one_time_donations': onetime_count,
            'amount_raised': float(campaign.amount_raised),
            'goal_amount': float(campaign.goal_amount),
            'created_at': campaign.created_at,
            'updated_at': campaign.updated_at
        })
