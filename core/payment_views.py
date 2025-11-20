"""
Payment and donation API views with Stripe integration
"""
import stripe
from decimal import Decimal
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404

from .models import Campaign, Organization, Donation, RecurringDonation, DonorProfile
from .serializers import CampaignSerializer, OrganizationSerializer, DonationSerializer

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class CampaignListView(generics.ListAPIView):
    """
    Get list of active campaigns
    GET /api/campaigns
    """
    serializer_class = CampaignSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Campaign.objects.filter(status='active').select_related('organization')
        
        # Optional filters
        org_id = self.request.query_params.get('organization')
        campaign_type = self.request.query_params.get('type')
        featured = self.request.query_params.get('featured')
        
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        if campaign_type:
            queryset = queryset.filter(campaign_type=campaign_type)
        if featured:
            queryset = queryset.filter(is_featured=True)
            
        return queryset.order_by('-is_featured', '-created_at')


class CampaignDetailView(generics.RetrieveAPIView):
    """
    Get campaign details
    GET /api/campaigns/<id>
    """
    serializer_class = CampaignSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Campaign.objects.filter(status='active').select_related('organization')


class OrganizationListView(generics.ListAPIView):
    """
    Get list of active organizations
    GET /api/organizations
    """
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Organization.objects.filter(status='active').order_by('-is_featured', 'name')


class OrganizationDetailView(generics.RetrieveAPIView):
    """
    Get organization details
    GET /api/organizations/<id>
    """
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Organization.objects.filter(status='active')


class CreateCheckoutSessionView(APIView):
    """
    Create Stripe checkout session for donation
    POST /api/donations/checkout
    
    Body:
    {
        "amount": 5000,  // in cents
        "currency": "usd",
        "interval": "one_time" or "monthly",
        "campaign_id": 1,  // optional
        "organization_id": 1,
        "is_anonymous": false,  // optional
        "covers_processing_fee": false,  // optional
        "dedication_type": "honor",  // optional
        "dedication_name": "John Doe"  // optional
    }
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            amount = request.data.get('amount')
            currency = request.data.get('currency', 'usd')
            interval = request.data.get('interval', 'one_time')
            campaign_id = request.data.get('campaign_id')
            organization_id = request.data.get('organization_id')
            is_anonymous = request.data.get('is_anonymous', False)
            covers_processing_fee = request.data.get('covers_processing_fee', False)
            
            # Validation
            if not amount or amount < 100:  # Minimum $1
                return Response(
                    {'error': 'Amount must be at least $1.00'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not organization_id:
                return Response(
                    {'error': 'Organization ID is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get organization
            organization = get_object_or_404(Organization, id=organization_id, status='active')
            
            # Get campaign if provided
            campaign = None
            if campaign_id:
                campaign = get_object_or_404(Campaign, id=campaign_id, status='active')
            
            # Calculate processing fee if covering
            processing_fee_amount = 0
            if covers_processing_fee:
                # Stripe fee: 2.9% + $0.30
                processing_fee_amount = int((amount * 0.029) + 30)
                amount += processing_fee_amount
            
            # Get or create Stripe customer
            stripe_customer_id = None
            if request.user.is_authenticated:
                try:
                    donor_profile = DonorProfile.objects.get(user=request.user)
                    stripe_customer_id = donor_profile.stripe_customer_id
                    
                    if not stripe_customer_id:
                        # Create Stripe customer
                        customer = stripe.Customer.create(
                            email=request.user.email,
                            name=f"{request.user.first_name} {request.user.last_name}",
                            metadata={
                                'user_id': request.user.id,
                                'donor_profile_id': donor_profile.id
                            }
                        )
                        stripe_customer_id = customer.id
                        donor_profile.stripe_customer_id = stripe_customer_id
                        donor_profile.save()
                except DonorProfile.DoesNotExist:
                    pass
            
            # Prepare metadata
            metadata = {
                'organization_id': organization_id,
                'is_anonymous': str(is_anonymous),
                'covers_processing_fee': str(covers_processing_fee),
                'processing_fee_amount': str(processing_fee_amount),
            }
            
            if campaign:
                metadata['campaign_id'] = campaign_id
            if request.user.is_authenticated:
                metadata['user_id'] = request.user.id
            if request.data.get('dedication_type'):
                metadata['dedication_type'] = request.data.get('dedication_type')
                metadata['dedication_name'] = request.data.get('dedication_name', '')
            
            # Create Stripe Checkout Session
            if interval == 'monthly':
                # Create recurring donation via subscription
                checkout_session = stripe.checkout.Session.create(
                    customer=stripe_customer_id,
                    mode='subscription',
                    line_items=[{
                        'price_data': {
                            'currency': currency,
                            'product_data': {
                                'name': f'Monthly Donation to {organization.name}',
                                'description': campaign.title if campaign else 'General Support',
                            },
                            'unit_amount': amount,
                            'recurring': {
                                'interval': 'month',
                            },
                        },
                        'quantity': 1,
                    }],
                    success_url=f"{settings.FRONTEND_URL}/donate/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{settings.FRONTEND_URL}/donate",
                    metadata=metadata,
                )
            else:
                # One-time donation
                checkout_session = stripe.checkout.Session.create(
                    customer=stripe_customer_id,
                    mode='payment',
                    line_items=[{
                        'price_data': {
                            'currency': currency,
                            'product_data': {
                                'name': f'Donation to {organization.name}',
                                'description': campaign.title if campaign else 'General Support',
                            },
                            'unit_amount': amount,
                        },
                        'quantity': 1,
                    }],
                    success_url=f"{settings.FRONTEND_URL}/donate/success?session_id={{CHECKOUT_SESSION_ID}}",
                    cancel_url=f"{settings.FRONTEND_URL}/donate",
                    metadata=metadata,
                )
            
            return Response({
                'sessionId': checkout_session.id,
                'url': checkout_session.url,
            }, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': 'An error occurred processing your request'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StripeWebhookView(APIView):
    """
    Handle Stripe webhook events
    POST /api/donations/webhook
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Handle the event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            self._handle_checkout_completed(session)
            
        elif event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            self._handle_payment_succeeded(payment_intent)
            
        elif event['type'] == 'invoice.paid':
            invoice = event['data']['object']
            self._handle_invoice_paid(invoice)
            
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            self._handle_subscription_cancelled(subscription)
            
        elif event['type'] == 'invoice.payment_failed':
            invoice = event['data']['object']
            self._handle_payment_failed(invoice)
        
        return Response(status=status.HTTP_200_OK)
    
    @transaction.atomic
    def _handle_checkout_completed(self, session):
        """Handle successful checkout session"""
        metadata = session.get('metadata', {})
        
        # Get related objects
        organization_id = metadata.get('organization_id')
        campaign_id = metadata.get('campaign_id')
        user_id = metadata.get('user_id')
        
        organization = Organization.objects.get(id=organization_id)
        campaign = Campaign.objects.get(id=campaign_id) if campaign_id else None
        donor_profile = None
        
        if user_id:
            try:
                donor_profile = DonorProfile.objects.get(user_id=user_id)
            except DonorProfile.DoesNotExist:
                pass
        
        # Check if it's a subscription (recurring) or one-time
        if session['mode'] == 'subscription':
            subscription_id = session.get('subscription')
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Create recurring donation record
            RecurringDonation.objects.create(
                donor=donor_profile,
                organization=organization,
                campaign=campaign,
                amount=Decimal(session['amount_total']) / 100,
                currency=session['currency'],
                frequency='monthly',
                stripe_subscription_id=subscription_id,
                stripe_customer_id=session.get('customer'),
                stripe_price_id=subscription['items']['data'][0]['price']['id'],
                status='active',
            )
        else:
            # Create one-time donation record
            payment_intent_id = session.get('payment_intent')
            
            Donation.objects.create(
                donor=donor_profile,
                organization=organization,
                campaign=campaign,
                amount=Decimal(session['amount_total']) / 100,
                currency=session['currency'],
                donation_type='one_time',
                covers_processing_fee=metadata.get('covers_processing_fee') == 'True',
                processing_fee_amount=Decimal(metadata.get('processing_fee_amount', 0)) / 100,
                stripe_payment_intent_id=payment_intent_id,
                stripe_customer_id=session.get('customer'),
                is_anonymous=metadata.get('is_anonymous') == 'True',
                dedication_type=metadata.get('dedication_type', 'none'),
                dedication_name=metadata.get('dedication_name', ''),
                status='completed',
            )
    
    def _handle_payment_succeeded(self, payment_intent):
        """Handle successful payment intent"""
        # Update donation status if needed
        try:
            donation = Donation.objects.get(
                stripe_payment_intent_id=payment_intent['id']
            )
            donation.status = 'completed'
            donation.stripe_charge_id = payment_intent.get('charges', {}).get('data', [{}])[0].get('id', '')
            donation.save()
        except Donation.DoesNotExist:
            pass
    
    def _handle_invoice_paid(self, invoice):
        """Handle successful recurring payment"""
        subscription_id = invoice.get('subscription')
        
        try:
            recurring = RecurringDonation.objects.get(
                stripe_subscription_id=subscription_id
            )
            
            # Create donation record for this recurring payment
            Donation.objects.create(
                donor=recurring.donor,
                organization=recurring.organization,
                campaign=recurring.campaign,
                recurring_donation=recurring,
                amount=recurring.amount,
                currency=recurring.currency,
                donation_type='recurring',
                stripe_payment_intent_id=invoice.get('payment_intent'),
                stripe_charge_id=invoice.get('charge'),
                stripe_customer_id=recurring.stripe_customer_id,
                stripe_subscription_id=subscription_id,
                status='completed',
            )
            
            # Update recurring donation stats
            recurring.successful_payments += 1
            recurring.total_payments += 1
            recurring.save()
            
        except RecurringDonation.DoesNotExist:
            pass
    
    def _handle_subscription_cancelled(self, subscription):
        """Handle subscription cancellation"""
        try:
            recurring = RecurringDonation.objects.get(
                stripe_subscription_id=subscription['id']
            )
            recurring.status = 'cancelled'
            recurring.save()
        except RecurringDonation.DoesNotExist:
            pass
    
    def _handle_payment_failed(self, invoice):
        """Handle failed recurring payment"""
        subscription_id = invoice.get('subscription')
        
        try:
            recurring = RecurringDonation.objects.get(
                stripe_subscription_id=subscription_id
            )
            recurring.failed_payments += 1
            recurring.total_payments += 1
            recurring.save()
        except RecurringDonation.DoesNotExist:
            pass


class CheckoutSuccessView(APIView):
    """
    Get checkout session details after successful payment
    GET /api/donations/checkout/success?session_id=xxx
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        session_id = request.query_params.get('session_id')
        
        if not session_id:
            return Response(
                {'error': 'Session ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            
            return Response({
                'amount': session.get('amount_total', 0) / 100,
                'currency': session.get('currency', 'usd'),
                'customer_email': session.get('customer_details', {}).get('email'),
                'payment_status': session.get('payment_status'),
            }, status=status.HTTP_200_OK)
            
        except stripe.error.StripeError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
