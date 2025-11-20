from django.contrib import admin
from .models import (
    Organization, DonorProfile, Campaign, 
    Donation, RecurringDonation, DonationReceipt
)


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'status', 'ein', 'is_featured', 'created_at']
    list_filter = ['status', 'is_featured', 'tax_exempt_status']
    search_fields = ['name', 'email', 'ein']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description', 'mission_statement', 'status', 'is_featured')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'website')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'zip_code')
        }),
        ('Legal & Tax', {
            'fields': ('ein', 'tax_exempt_status')
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url')
        }),
        ('Branding', {
            'fields': ('logo', 'primary_color')
        }),
        ('Stripe Integration', {
            'fields': ('stripe_account_id',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(DonorProfile)
class DonorProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'donor_type', 'total_donated', 'donation_count', 'lifecycle_status', 'last_donation_date']
    list_filter = ['donor_type', 'lifecycle_status', 'preferred_communication', 'email_opt_in']
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name', 'phone', 'stripe_customer_id']
    readonly_fields = ['total_donated', 'donation_count', 'first_donation_date', 'last_donation_date', 
                       'average_donation', 'engagement_score', 'created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Donor Information', {
            'fields': ('donor_type', 'company_name')
        }),
        ('Contact Preferences', {
            'fields': ('phone', 'preferred_communication', 'email_opt_in', 'sms_opt_in')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'zip_code', 'country')
        }),
        ('Giving Statistics (Auto-calculated)', {
            'fields': ('total_donated', 'donation_count', 'first_donation_date', 
                      'last_donation_date', 'average_donation'),
            'classes': ('collapse',)
        }),
        ('Segmentation', {
            'fields': ('lifecycle_status', 'engagement_score', 'tags', 'source_channel')
        }),
        ('Stripe', {
            'fields': ('stripe_customer_id',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['recalculate_giving_stats']
    
    def recalculate_giving_stats(self, request, queryset):
        for donor in queryset:
            donor.update_giving_metadata()
        self.message_user(request, f"Updated stats for {queryset.count()} donors")
    recalculate_giving_stats.short_description = "Recalculate giving statistics"


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'organization', 'campaign_type', 'goal_amount', 'amount_raised', 
                    'progress_display', 'status', 'start_date', 'end_date']
    list_filter = ['status', 'campaign_type', 'is_featured', 'is_matching', 'organization']
    search_fields = ['title', 'slug', 'description', 'organization__name']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['amount_raised', 'donor_count', 'progress_display', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('organization', 'title', 'slug', 'description', 'campaign_type', 'status', 'is_featured')
        }),
        ('Goals & Timeline', {
            'fields': ('goal_amount', 'start_date', 'end_date')
        }),
        ('Progress (Auto-calculated)', {
            'fields': ('amount_raised', 'donor_count', 'progress_display'),
            'classes': ('collapse',)
        }),
        ('Matching Campaign', {
            'fields': ('is_matching', 'matching_amount', 'matching_sponsor')
        }),
        ('Impact Metrics', {
            'fields': ('impact_metric_label', 'impact_metric_value', 'impact_metric_amount')
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def progress_display(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_display.short_description = "Progress"
    
    actions = ['update_campaign_progress']
    
    def update_campaign_progress(self, request, queryset):
        for campaign in queryset:
            campaign.update_progress()
        self.message_user(request, f"Updated progress for {queryset.count()} campaigns")
    update_campaign_progress.short_description = "Update campaign progress"


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['id', 'donor_username', 'organization', 'amount', 'donation_type', 
                    'status', 'created_at', 'completed_at']
    list_filter = ['status', 'donation_type', 'covers_processing_fee', 'is_anonymous', 
                   'organization', 'campaign']
    search_fields = ['donor__user__username', 'donor__user__email', 'stripe_payment_intent_id', 
                    'stripe_charge_id', 'stripe_customer_id']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Relationships', {
            'fields': ('donor', 'organization', 'campaign', 'recurring_donation')
        }),
        ('Donation Details', {
            'fields': ('amount', 'currency', 'donation_type', 'status')
        }),
        ('Processing Fee', {
            'fields': ('covers_processing_fee', 'processing_fee_amount')
        }),
        ('Stripe Information', {
            'fields': ('stripe_payment_intent_id', 'stripe_charge_id', 
                      'stripe_customer_id', 'stripe_subscription_id'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('is_anonymous', 'dedication_type', 'dedication_name', 'donor_comment', 'failure_reason')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'completed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def donor_username(self, obj):
        return obj.donor.user.username
    donor_username.short_description = "Donor"


@admin.register(RecurringDonation)
class RecurringDonationAdmin(admin.ModelAdmin):
    list_display = ['id', 'donor_username', 'organization', 'amount', 'frequency', 
                    'status', 'successful_payments', 'next_payment_date']
    list_filter = ['status', 'frequency', 'organization']
    search_fields = ['donor__user__username', 'donor__user__email', 'stripe_subscription_id', 
                    'stripe_customer_id']
    readonly_fields = ['total_payments', 'successful_payments', 'failed_payments', 
                      'start_date', 'created_at', 'updated_at']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Relationships', {
            'fields': ('donor', 'organization', 'campaign')
        }),
        ('Subscription Details', {
            'fields': ('amount', 'currency', 'frequency', 'status')
        }),
        ('Stripe Information', {
            'fields': ('stripe_subscription_id', 'stripe_customer_id', 'stripe_price_id'),
            'classes': ('collapse',)
        }),
        ('Payment Statistics', {
            'fields': ('total_payments', 'successful_payments', 'failed_payments')
        }),
        ('Dates', {
            'fields': ('start_date', 'next_payment_date', 'cancelled_at')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def donor_username(self, obj):
        return obj.donor.user.username
    donor_username.short_description = "Donor"
    
    actions = ['cancel_subscriptions']
    
    def cancel_subscriptions(self, request, queryset):
        count = 0
        for subscription in queryset:
            if subscription.status == 'active':
                subscription.cancel()
                count += 1
        self.message_user(request, f"Cancelled {count} subscriptions")
    cancel_subscriptions.short_description = "Cancel selected subscriptions"


@admin.register(DonationReceipt)
class DonationReceiptAdmin(admin.ModelAdmin):
    list_display = ['receipt_number', 'donor_name', 'amount', 'tax_year', 
                    'receipt_date', 'email_sent']
    list_filter = ['tax_year', 'email_sent']
    search_fields = ['receipt_number', 'donor_name', 'donor_email', 'donation__donor__user__username']
    readonly_fields = ['receipt_number', 'receipt_date', 'created_at']
    date_hierarchy = 'receipt_date'
    
    fieldsets = (
        ('Receipt Information', {
            'fields': ('receipt_number', 'receipt_date', 'tax_year')
        }),
        ('Donation', {
            'fields': ('donation',)
        }),
        ('Donor Information (Snapshot)', {
            'fields': ('donor_name', 'donor_email', 'donor_address')
        }),
        ('Organization Information (Snapshot)', {
            'fields': ('organization_name', 'organization_ein', 'organization_address')
        }),
        ('Amount', {
            'fields': ('amount', 'currency')
        }),
        ('PDF & Email', {
            'fields': ('pdf_file', 'email_sent', 'email_sent_at')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
