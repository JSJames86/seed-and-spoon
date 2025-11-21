'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
      } else {
        setError('Campaign not found');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform) => {
    const text = `Support ${campaign?.title} - ${campaign?.organization_name}`;
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(campaign?.title)}&body=${encodeURIComponent(text + ' ' + shareUrl)}`,
    };

    if (platform === 'email') {
      window.location.href = urls[platform];
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'This campaign does not exist.'}</p>
          <Link
            href="/campaigns"
            className="bg-primary-soil text-white px-6 py-3 rounded-lg hover:bg-gradient-green font-bold transition-all"
          >
            View All Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const progress = Math.min((campaign.amount_raised / campaign.goal_amount) * 100, 100);
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-soil to-gradient-green text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-white/80 hover:text-white mb-4 text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="heading-xl mb-3">{campaign.title}</h1>
              <p className="body-md mb-4">by {campaign.organization_name}</p>
              {campaign.is_matching && (
                <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-bold text-sm">
                  🎉 Matching Donations Available!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="heading-md text-charcoal mb-4">About This Campaign</h2>
              <div className="prose max-w-none">
                <p className="body-md text-gray-700 whitespace-pre-line">{campaign.description}</p>
              </div>
            </div>

            {/* Impact Metrics */}
            {campaign.impact_metric_label && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="heading-md text-charcoal mb-4">Your Impact</h2>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <p className="text-green-900 font-bold text-lg mb-2">
                    {campaign.impact_metric_label}
                  </p>
                  <p className="text-green-700">
                    Every ${campaign.impact_metric_amount} provides {campaign.impact_metric_value} {campaign.impact_metric_label}
                  </p>
                </div>
              </div>
            )}

            {/* Matching Info */}
            {campaign.is_matching && campaign.matching_sponsor && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="heading-md text-charcoal mb-4">Matching Donation</h2>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <p className="text-orange-900 font-bold text-lg mb-2">
                    Double Your Impact!
                  </p>
                  <p className="text-orange-700 mb-2">
                    Thanks to {campaign.matching_sponsor}, all donations will be matched up to {formatCurrency(campaign.matching_amount)}!
                  </p>
                  <p className="text-orange-600 text-sm">
                    Your donation will go twice as far in supporting this campaign.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-charcoal mb-2">
                  {formatCurrency(campaign.amount_raised)}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  raised of {formatCurrency(campaign.goal_amount)} goal
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-primary-soil to-gradient-green h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-600">{Math.round(progress)}% funded</div>
              </div>

              {/* Stats */}
              <div className="border-t border-gray-200 pt-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign Type</span>
                  <span className="font-bold text-charcoal capitalize">{campaign.campaign_type}</span>
                </div>
                {daysLeft !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Days Left</span>
                    <span className="font-bold text-charcoal">{daysLeft} days</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Started</span>
                  <span className="font-bold text-charcoal">{formatDate(campaign.start_date)}</span>
                </div>
              </div>

              {/* Donate Button */}
              <Link
                href={`/donate?campaign=${campaign.slug}`}
                className="block w-full text-center bg-primary-soil text-white py-4 px-6 rounded-lg hover:bg-gradient-green font-bold transition-all text-lg shadow-lg hover:shadow-xl mb-4"
              >
                Donate Now
              </Link>

              {/* Share Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-charcoal mb-3">Share This Campaign</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center gap-2 bg-blue-400 text-white py-2 px-4 rounded-lg hover:bg-blue-500 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center gap-2 bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </button>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-charcoal py-2 px-4 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
