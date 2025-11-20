"""
Views for volunteer opportunity and application management
"""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import VolunteerOpportunity, VolunteerApplication
from .serializers import (
    VolunteerOpportunitySerializer, 
    VolunteerApplicationSerializer,
    VolunteerApplicationCreateSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow read-only access to all, write access to admins only"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_superuser or request.user.is_staff)


class VolunteerOpportunityListView(generics.ListAPIView):
    """Public endpoint to list active volunteer opportunities"""
    queryset = VolunteerOpportunity.objects.filter(is_active=True)
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Disable pagination for volunteer opportunities


class VolunteerOpportunityDetailView(generics.RetrieveAPIView):
    """Public endpoint to get volunteer opportunity details"""
    queryset = VolunteerOpportunity.objects.filter(is_active=True)
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'


class VolunteerOpportunityCreateView(generics.CreateAPIView):
    """Admin-only endpoint to create volunteer opportunities"""
    queryset = VolunteerOpportunity.objects.all()
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.IsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VolunteerOpportunityUpdateView(generics.UpdateAPIView):
    """Admin-only endpoint to update volunteer opportunities"""
    queryset = VolunteerOpportunity.objects.all()
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'slug'


class VolunteerOpportunityDeleteView(generics.DestroyAPIView):
    """Admin-only endpoint to delete volunteer opportunities"""
    queryset = VolunteerOpportunity.objects.all()
    serializer_class = VolunteerOpportunitySerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'slug'


class VolunteerApplicationCreateView(generics.CreateAPIView):
    """Public endpoint for users to submit volunteer applications"""
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationCreateSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': 'Application submitted successfully! We will review your application and contact you soon.',
                'application': serializer.data
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )


class VolunteerApplicationListView(generics.ListAPIView):
    """Admin-only endpoint to list all volunteer applications"""
    queryset = VolunteerApplication.objects.all().order_by('-created_at')
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAdminUser]


class VolunteerApplicationDetailView(generics.RetrieveUpdateAPIView):
    """Admin-only endpoint to view and update volunteer applications"""
    queryset = VolunteerApplication.objects.all()
    serializer_class = VolunteerApplicationSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def perform_update(self, serializer):
        # Track who reviewed the application
        if 'status' in self.request.data:
            from django.utils import timezone
            serializer.save(
                reviewed_by=self.request.user,
                reviewed_at=timezone.now()
            )
        else:
            serializer.save()
