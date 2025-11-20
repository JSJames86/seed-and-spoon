"""
Management command to create sample data for development
Usage: python manage.py create_sample_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
import random

from core.models import (
    Organization, DonorProfile, Campaign, 
    Donation, RecurringDonation
)


class Command(BaseCommand):
    help = 'Creates sample data for development'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating sample data...')
        
        # Create Organizations
        orgs = self.create_organizations()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(orgs)} organizations'))
        
        # Create Donors
        donors = self.create_donors()
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(donors)} donor profiles'))
        
        # Create Campaigns
        campaigns = self.create_campaigns(orgs)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(campaigns)} campaigns'))
        
        # Create Donations
        donations = self.create_donations(donors, orgs, campaigns)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(donations)} donations'))
        
        # Create Recurring Donations
        recurring = self.create_recurring_donations(donors, orgs, campaigns)
        self.stdout.write(self.style.SUCCESS(f'✓ Created {len(recurring)} recurring donations'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Sample data created successfully!'))
        self.stdout.write('\nYou can now:')
        self.stdout.write('  - Login to Django admin: http://localhost:8000/admin')
        self.stdout.write('  - Create a superuser: python manage.py createsuperuser')

    def create_organizations(self):
        orgs_data = [
            {
                'name': 'Seed & Spoon NJ',
                'slug': 'seed-and-spoon-nj',
                'description': 'Building food sovereignty in Essex County—one family, one meal, one skill at a time.',
                'email': 'info@seedandspoon.org',
                'city': 'Newark',
                'state': 'NJ',
                'status': 'active',
                'is_featured': True,
            },
            {
                'name': 'Community Gardens Coalition',
                'slug': 'community-gardens-coalition',
                'description': 'Empowering neighborhoods through urban agriculture.',
                'email': 'hello@cgc.org',
                'city': 'Jersey City',
                'state': 'NJ',
                'status': 'active',
            },
            {
                'name': 'Food Justice Initiative',
                'slug': 'food-justice-initiative',
                'description': 'Fighting food deserts and promoting nutrition education.',
                'email': 'contact@foodjustice.org',
                'city': 'Paterson',
                'state': 'NJ',
                'status': 'active',
            },
        ]
        
        orgs = []
        for data in orgs_data:
            org, created = Organization.objects.get_or_create(
                slug=data['slug'],
                defaults=data
            )
            orgs.append(org)
        
        return orgs

    def create_donors(self):
        donors_data = [
            ('john_donor', 'John', 'Smith', 'john@example.com'),
            ('jane_donor', 'Jane', 'Doe', 'jane@example.com'),
            ('mike_donor', 'Mike', 'Johnson', 'mike@example.com'),
            ('sarah_donor', 'Sarah', 'Williams', 'sarah@example.com'),
            ('david_donor', 'David', 'Brown', 'david@example.com'),
        ]
        
        donors = []
        for username, first, last, email in donors_data:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'first_name': first,
                    'last_name': last,
                    'email': email,
                }
            )
            
            profile, created = DonorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'phone': f'555-{random.randint(1000, 9999)}',
                    'city': random.choice(['Newark', 'Jersey City', 'Paterson']),
                    'state': 'NJ',
                    'zip_code': f'0{random.randint(7100, 7199)}',
                    'source_channel': random.choice(['web', 'event', 'referral']),
                }
            )
            donors.append(profile)
        
        return donors

    def create_campaigns(self, orgs):
        campaigns_data = [
            {
                'title': 'Winter Food Drive 2025',
                'slug': 'winter-food-drive-2025',
                'description': 'Help us provide nutritious meals to 500 families this winter.',
                'campaign_type': 'project',
                'goal_amount': Decimal('25000.00'),
                'impact_metric_label': 'families fed',
                'impact_metric_value': 1,
                'impact_metric_amount': Decimal('50.00'),
            },
            {
                'title': 'General Fund',
                'slug': 'general-fund',
                'description': 'Support our ongoing community programs.',
                'campaign_type': 'general',
                'goal_amount': Decimal('50000.00'),
            },
            {
                'title': 'Spring Garden Project',
                'slug': 'spring-garden-project',
                'description': 'Build 10 new community gardens across Essex County.',
                'campaign_type': 'project',
                'goal_amount': Decimal('15000.00'),
                'impact_metric_label': 'gardens built',
                'impact_metric_value': 1,
                'impact_metric_amount': Decimal('1500.00'),
            },
        ]
        
        campaigns = []
        for i, data in enumerate(campaigns_data):
            org = orgs[i % len(orgs)]
            start_date = timezone.now() - timedelta(days=random.randint(10, 60))
            end_date = start_date + timedelta(days=90)
            
            campaign, created = Campaign.objects.get_or_create(
                slug=data['slug'],
                defaults={
                    **data,
                    'organization': org,
                    'start_date': start_date,
                    'end_date': end_date,
                    'status': 'live',
                }
            )
            campaigns.append(campaign)
        
        return campaigns

    def create_donations(self, donors, orgs, campaigns):
        donations = []
        
        for _ in range(15):
            donor = random.choice(donors)
            org = random.choice(orgs)
            campaign = random.choice(campaigns + [None])
            
            amount = Decimal(random.choice([25, 50, 100, 250, 500]))
            created_at = timezone.now() - timedelta(days=random.randint(1, 90))
            
            donation = Donation.objects.create(
                donor=donor,
                organization=org,
                campaign=campaign,
                amount=amount,
                currency='USD',
                donation_type='one_time',
                status='succeeded',
                stripe_payment_intent_id=f'pi_test_{random.randint(100000, 999999)}',
                stripe_charge_id=f'ch_test_{random.randint(100000, 999999)}',
                created_at=created_at,
                completed_at=created_at,
            )
            donations.append(donation)
        
        return donations

    def create_recurring_donations(self, donors, orgs, campaigns):
        recurring = []
        
        for _ in range(5):
            donor = random.choice(donors)
            org = random.choice(orgs)
            campaign = random.choice(campaigns + [None, None])
            
            amount = Decimal(random.choice([10, 25, 50, 100]))
            
            recurring_donation = RecurringDonation.objects.create(
                donor=donor,
                organization=org,
                campaign=campaign,
                amount=amount,
                currency='USD',
                frequency='monthly',
                status='active',
                stripe_subscription_id=f'sub_test_{random.randint(100000, 999999)}',
                stripe_customer_id=f'cus_test_{random.randint(100000, 999999)}',
                successful_payments=random.randint(1, 12),
            )
            recurring.append(recurring_donation)
        
        return recurring
