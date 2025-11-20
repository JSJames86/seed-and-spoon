from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal


class Organization(models.Model):
    """Nonprofit organizations partnered with Seed & Spoon"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('pending', 'Pending Approval'),
        ('suspended', 'Suspended'),
        ('archived', 'Archived'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    mission_statement = models.TextField(blank=True)
    
    # Contact Information
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    website = models.URLField(blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    
    # Legal & Tax
    ein = models.CharField(max_length=20, blank=True, help_text="Employer Identification Number")
    tax_exempt_status = models.BooleanField(default=True)
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    
    # Branding
    logo = models.ImageField(upload_to='organization_logos/', blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#233D00', help_text="Hex color code")
    
    # Status & Settings
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_featured = models.BooleanField(default=False)
    
    # Stripe Integration (for future Stripe Connect)
    stripe_account_id = models.CharField(max_length=255, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.name


class OrganizationAdmin(models.Model):
    """Links users to organizations as admins"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='org_admin_roles')
    organization = models.ForeignKey('Organization', on_delete=models.CASCADE, related_name='admins')
    role = models.CharField(max_length=20, choices=[
        ('admin', 'Administrator'),
        ('editor', 'Editor'),
        ('viewer', 'Viewer'),
    ], default='admin')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='org_admins_created')
    
    class Meta:
        unique_together = ['user', 'organization']
        indexes = [
            models.Index(fields=['user', 'organization']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.organization.name} ({self.role})"


class DonorProfile(models.Model):
    """Extended profile for donors with preferences and giving history metadata"""
    
    COMMUNICATION_PREFERENCES = [
        ('email', 'Email'),
        ('sms', 'SMS'),
        ('phone', 'Phone'),
        ('none', 'No Communication'),
    ]
    
    DONOR_TYPE = [
        ('individual', 'Individual'),
        ('corporate', 'Corporate'),
        ('foundation', 'Foundation'),
    ]
    
    LIFECYCLE_STATUS = [
        ('new', 'New Donor'),
        ('active', 'Active'),
        ('lapsed', 'Lapsed'),
        ('reactivated', 'Reactivated'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='donor_profile')
    
    # Contact Preferences
    phone = models.CharField(max_length=20, blank=True)
    preferred_communication = models.CharField(
        max_length=10, 
        choices=COMMUNICATION_PREFERENCES, 
        default='email'
    )
    email_opt_in = models.BooleanField(default=True)
    sms_opt_in = models.BooleanField(default=False)
    
    # Donor Information
    donor_type = models.CharField(max_length=20, choices=DONOR_TYPE, default='individual')
    company_name = models.CharField(max_length=255, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=2, blank=True)
    zip_code = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=2, default='US')
    
    # Giving Metadata (cached for performance)
    total_donated = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    donation_count = models.IntegerField(default=0)
    first_donation_date = models.DateTimeField(null=True, blank=True)
    last_donation_date = models.DateTimeField(null=True, blank=True)
    average_donation = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Lifecycle & Segmentation
    lifecycle_status = models.CharField(max_length=20, choices=LIFECYCLE_STATUS, default='new')
    engagement_score = models.IntegerField(default=0, help_text="0-100 score based on giving patterns")
    tags = models.JSONField(default=list, blank=True, help_text="Manual tags like 'major donor', 'monthly'")
    source_channel = models.CharField(max_length=50, blank=True, help_text="web, event, referral, etc.")
    
    # Stripe Integration
    stripe_customer_id = models.CharField(max_length=255, blank=True, unique=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_donation_date']
        indexes = [
            models.Index(fields=['stripe_customer_id']),
            models.Index(fields=['lifecycle_status', 'engagement_score']),
            models.Index(fields=['last_donation_date']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - Donor Profile"
    
    def update_giving_metadata(self):
        """Recalculate giving statistics from donations"""
        from django.db.models import Sum, Avg, Count, Min, Max
        
        donations = self.donations.filter(status='succeeded')
        stats = donations.aggregate(
            total=Sum('amount'),
            count=Count('id'),
            avg=Avg('amount'),
            first=Min('created_at'),
            last=Max('created_at')
        )
        
        self.total_donated = stats['total'] or Decimal('0.00')
        self.donation_count = stats['count'] or 0
        self.average_donation = stats['avg'] or Decimal('0.00')
        self.first_donation_date = stats['first']
        self.last_donation_date = stats['last']
        
        # Update lifecycle status
        if self.donation_count == 1:
            self.lifecycle_status = 'new'
        elif self.last_donation_date and (timezone.now() - self.last_donation_date).days > 365:
            self.lifecycle_status = 'lapsed'
        else:
            self.lifecycle_status = 'active'
        
        self.save()


class Campaign(models.Model):
    """Fundraising campaigns for specific causes or programs"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('live', 'Live'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('archived', 'Archived'),
    ]
    
    CAMPAIGN_TYPE = [
        ('general', 'General Fund'),
        ('project', 'Specific Project'),
        ('emergency', 'Emergency Relief'),
        ('matching', 'Matching Campaign'),
    ]
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='campaigns')
    
    # Basic Information
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField()
    campaign_type = models.CharField(max_length=20, choices=CAMPAIGN_TYPE, default='general')
    
    # Goals & Timeline
    goal_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Progress (cached for performance)
    amount_raised = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    donor_count = models.IntegerField(default=0)
    
    # Matching Campaign Settings
    is_matching = models.BooleanField(default=False)
    matching_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    matching_sponsor = models.CharField(max_length=255, blank=True)
    
    # Impact Metrics
    impact_metric_label = models.CharField(
        max_length=100, 
        blank=True, 
        help_text="e.g., 'meals provided', 'families fed'"
    )
    impact_metric_value = models.IntegerField(
        null=True, 
        blank=True, 
        help_text="How many units per $X donated"
    )
    impact_metric_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        help_text="Dollar amount for impact metric (e.g., $25 = 1 family fed)"
    )
    
    # Media
    featured_image = models.ImageField(upload_to='campaign_images/', blank=True, null=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'is_featured']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.organization.name}"
    
    @property
    def progress_percentage(self):
        """Calculate percentage of goal reached"""
        if self.goal_amount > 0:
            return min(float((self.amount_raised / self.goal_amount) * 100), 100)
        return 0
    
    def update_progress(self):
        """Recalculate campaign progress from donations"""
        from django.db.models import Sum, Count
        
        donations = self.donations.filter(status='succeeded')
        stats = donations.aggregate(
            total=Sum('amount'),
            count=Count('donor', distinct=True)
        )
        
        self.amount_raised = stats['total'] or Decimal('0.00')
        self.donor_count = stats['count'] or 0
        self.save()


class Donation(models.Model):
    """Individual donation records"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('succeeded', 'Succeeded'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
        ('partially_refunded', 'Partially Refunded'),
        ('cancelled', 'Cancelled'),
    ]
    
    DONATION_TYPE = [
        ('one_time', 'One-Time'),
        ('recurring', 'Recurring'),
    ]
    
    # Relationships
    donor = models.ForeignKey(DonorProfile, on_delete=models.PROTECT, related_name='donations')
    organization = models.ForeignKey(Organization, on_delete=models.PROTECT, related_name='donations')
    campaign = models.ForeignKey(
        Campaign, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='donations'
    )
    recurring_donation = models.ForeignKey(
        'RecurringDonation',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment_history'
    )
    
    # Donation Details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    currency = models.CharField(max_length=3, default='USD')
    donation_type = models.CharField(max_length=20, choices=DONATION_TYPE, default='one_time')
    
    # Processing Fee Coverage
    covers_processing_fee = models.BooleanField(default=False)
    processing_fee_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    
    # Stripe Integration
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    stripe_charge_id = models.CharField(max_length=255, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    
    # Status & Metadata
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')
    failure_reason = models.TextField(blank=True)
    
    # Anonymous Donation
    is_anonymous = models.BooleanField(default=False)
    
    # Custom Fields
    dedication_type = models.CharField(
        max_length=20, 
        choices=[('in_honor', 'In Honor Of'), ('in_memory', 'In Memory Of'), ('none', 'None')],
        default='none'
    )
    dedication_name = models.CharField(max_length=255, blank=True)
    donor_comment = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['donor', 'status']),
            models.Index(fields=['organization', 'status']),
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['stripe_payment_intent_id']),
            models.Index(fields=['stripe_subscription_id']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"${self.amount} from {self.donor.user.username} to {self.organization.name}"
    
    def save(self, *args, **kwargs):
        # Set completed_at when status changes to succeeded
        if self.status == 'succeeded' and not self.completed_at:
            self.completed_at = timezone.now()
        
        super().save(*args, **kwargs)
        
        # Update cached stats after save
        if self.status == 'succeeded':
            self.donor.update_giving_metadata()
            if self.campaign:
                self.campaign.update_progress()


class RecurringDonation(models.Model):
    """Monthly recurring donation subscriptions"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
        ('failed', 'Failed'),
    ]
    
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]
    
    # Relationships
    donor = models.ForeignKey(DonorProfile, on_delete=models.CASCADE, related_name='recurring_donations')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='recurring_donations')
    campaign = models.ForeignKey(
        Campaign, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='recurring_donations'
    )
    
    # Subscription Details
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('1.00'))]
    )
    currency = models.CharField(max_length=3, default='USD')
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    
    # Stripe Integration
    stripe_subscription_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255)
    stripe_price_id = models.CharField(max_length=255, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Statistics
    total_payments = models.IntegerField(default=0)
    successful_payments = models.IntegerField(default=0)
    failed_payments = models.IntegerField(default=0)
    
    # Dates
    start_date = models.DateTimeField(auto_now_add=True)
    next_payment_date = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['donor', 'status']),
            models.Index(fields=['stripe_subscription_id']),
            models.Index(fields=['status', 'next_payment_date']),
        ]
    
    def __str__(self):
        return f"${self.amount}/{self.frequency} from {self.donor.user.username}"
    
    def cancel(self):
        """Cancel the recurring donation"""
        self.status = 'cancelled'
        self.cancelled_at = timezone.now()
        self.save()


class DonationReceipt(models.Model):
    """Tax receipts for donations"""
    
    donation = models.OneToOneField(Donation, on_delete=models.CASCADE, related_name='receipt')
    
    # Receipt Information
    receipt_number = models.CharField(max_length=50, unique=True)
    receipt_date = models.DateTimeField(auto_now_add=True)
    tax_year = models.IntegerField()
    
    # Recipient Information (snapshot at time of receipt)
    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    donor_address = models.TextField(blank=True)
    
    # Organization Information (snapshot)
    organization_name = models.CharField(max_length=255)
    organization_ein = models.CharField(max_length=20, blank=True)
    organization_address = models.TextField(blank=True)
    
    # Donation Details (snapshot)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    
    # PDF Storage
    pdf_file = models.FileField(upload_to='receipts/%Y/', blank=True, null=True)
    
    # Email Tracking
    email_sent = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-receipt_date']
        indexes = [
            models.Index(fields=['tax_year', 'receipt_date']),
        ]
    
    def __str__(self):
        return f"Receipt #{self.receipt_number} - {self.donor_name} - {self.tax_year}"


class VolunteerOpportunity(models.Model):
    """Volunteer roles and opportunities managed by super-admins"""
    
    CATEGORY_CHOICES = [
        ('admin', 'Admin'),
        ('kitchen', 'Kitchen'),
        ('logistics', 'Logistics'),
        ('support', 'Support'),
    ]
    
    DAYS_CHOICES = [
        ('monday', 'Monday'),
        ('tuesday', 'Tuesday'),
        ('wednesday', 'Wednesday'),
        ('thursday', 'Thursday'),
        ('friday', 'Friday'),
        ('saturday', 'Saturday'),
        ('sunday', 'Sunday'),
    ]
    
    title = models.CharField(max_length=200)
    emoji = models.CharField(max_length=10, default='📋')
    slug = models.SlugField(max_length=200, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    schedule = models.CharField(max_length=100, help_text="e.g., 'Mon-Fri (few hrs/day)'")
    duties = models.JSONField(default=list, help_text="List of duties/responsibilities")
    ideal_for = models.TextField(help_text="Who this role is ideal for")
    summary = models.TextField(help_text="Brief summary of the role")
    days_available = models.JSONField(default=list, help_text="List of day slugs: ['monday', 'tuesday']")
    is_paid = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='volunteer_opportunities_created')
    
    class Meta:
        ordering = ['sort_order', 'title']
        indexes = [
            models.Index(fields=['category', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.emoji} {self.title}"


class VolunteerApplication(models.Model):
    """Applications from users wanting to volunteer"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('contacted', 'Contacted'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='volunteer_applications')
    full_name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    preferred_contact = models.CharField(max_length=10, choices=[('email', 'Email'), ('phone', 'Phone')], default='email')
    roles = models.JSONField(default=list, help_text="List of opportunity IDs or titles")
    availability = models.TextField()
    resume = models.FileField(upload_to='volunteer_resumes/', blank=True, null=True)
    linkedin = models.URLField(blank=True)
    accessibility_notes = models.TextField(blank=True)
    transportation = models.CharField(max_length=200, blank=True)
    message = models.TextField(blank=True)
    orientation_agreed = models.BooleanField(default=False)
    photo_consent = models.BooleanField(default=False)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_applications')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, help_text="Internal notes from reviewers")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.full_name} - {self.status}"
