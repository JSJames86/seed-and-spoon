'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('50');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const presetAmounts = ['25', '50', '100', '250'];

  useEffect(() => {
    if (params.slug) {
      fetchCampaign();
    }
  }, [params.slug]);

  const fetchCampaign = async () => {
    try {
      const response = await fetch(`${API_URL}/api/campaigns/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    const finalAmount = isCustom ? parseFloat(customAmount) : parseFloat(donationAmount);
    
    if (!finalAmount || finalAmount < 1) {
      alert('Please enter a valid donation amount (minimum $1)');
      return;
    }

    setIsProcessing(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/donations/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          amount: Math.round(finalAmount * 100), // Convert to cents
          currency: 'usd',
          campaign_id: campaign.id,
          organization_id: campaign.organization.id,
          interval: 'one_time',
          success_url: `${window.location.origin}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href,
        }),
      });

      const data = await response.json();

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    return Math.min((campaign.amount_raised / campaign.goal_amount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal mb-4">Campaign Not Found</h1>
          <button
            onClick={() => router.push('/campaigns')}
            className="text-primary-soil hover:text-gradient-green"
          >
            ← Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/campaigns')}
          className="text-primary-soil hover:text-gradient-green mb-6 flex items-center"
        >
          ← Back to Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            {/* Campaign Image */}
            {campaign.featured_image ? (
              <div className="relative h-96 w-full rounded-lg overflow-hidden mb-6">
                <Image
                  src={campaign.featured_image}
                  alt={campaign.title}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-96 w-full bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-6">
                <span className="text-8xl">🌱</span>
              </div>
            )}

            {/* Campaign Title & Badges */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary-soil rounded-full">
                  {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                </span>
                {campaign.is_matching && (
                  <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                    🎁 Matching donations available
                  </span>
                )}
                {campaign.is_featured && (
                  <span className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-charcoal mb-4">
                {campaign.title}
              </h1>

              {/* Organization Info */}
              <div className="flex items-center gap-3 text-gray-600 mb-6">
                <span>By</span>
                <span className="font-semibold text-primary-soil">
                  {campaign.organization.name}
                </span>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </p>
              </div>

              {/* Matching Info */}
              {campaign.is_matching && campaign.matching_sponsor && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    Matching Donation Available!
                  </h3>
                  <p className="text-orange-800 text-sm">
                    Every donation is matched by <strong>{campaign.matching_sponsor}</strong>
                    {campaign.matching_amount && ` up to ${formatCurrency(campaign.matching_amount)}`}
                  </p>
                </div>
              )}

              {/* Impact Metric */}
              {campaign.impact_metric_label && (
                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Your Impact</h3>
                  <p className="text-green-800">
                    {campaign.impact_metric_label}
                  </p>
                  {campaign.impact_metric_value && campaign.impact_metric_amount && (
                    <p className="text-sm text-green-700 mt-2">
                      ${campaign.impact_metric_amount} = {campaign.impact_metric_value} {campaign.impact_metric_label.split(' ').pop()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {/* Progress */}
              <div className="mb-6">
                <div className="text-3xl font-bold text-charcoal mb-2">
                  {formatCurrency(campaign.amount_raised)}
                </div>
                <div className="text-gray-600 mb-4">
                  raised of {formatCurrency(campaign.goal_amount)} goal
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-primary-soil h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{Math.round(progress)}% funded</span>
                  <span>{campaign.donor_count} donors</span>
                </div>
              </div>

              {/* Donation Form */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-charcoal mb-4">
                  Support This Campaign
                </h3>

                {/* Amount Selection */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {presetAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => {
                        setDonationAmount(amount);
                        setIsCustom(false);
                        setCustomAmount('');
                      }}
                      className={`py-3 px-4 rounded-md font-semibold transition-colors ${
                        !isCustom && donationAmount === amount
                          ? 'bg-primary-soil text-white'
                          : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <button
                  onClick={() => setIsCustom(true)}
                  className={`w-full py-3 px-4 rounded-md font-semibold mb-4 transition-colors ${
                    isCustom
                      ? 'bg-primary-soil text-white'
                      : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                  }`}
                >
                  Custom Amount
                </button>

                {isCustom && (
                  <div className="mb-4">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                    />
                  </div>
                )}

                {/* Donate Button */}
                <button
                  onClick={handleDonate}
                  disabled={isProcessing}
                  className="w-full bg-primary-soil text-white py-4 px-6 rounded-md hover:bg-gradient-green font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Donate Now'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
