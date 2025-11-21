'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      setFilteredCampaigns(campaigns);
    } else {
      setFilteredCampaigns(campaigns.filter(c => c.campaign_type === filter));
    }
  }, [filter, campaigns]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/api/campaigns/`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
        setFilteredCampaigns(data);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const featuredCampaigns = campaigns.filter(c => c.is_featured);
  const activeCampaigns = filteredCampaigns.filter(c => c.is_featured === false);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-soil to-gradient-green text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="heading-xl mb-4">Our Campaigns</h1>
          <p className="body-lg max-w-2xl mx-auto">
            Support our mission to fight food insecurity in Essex County. Every donation makes a real difference.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              filter === 'all'
                ? 'bg-primary-soil text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            All Campaigns
          </button>
          <button
            onClick={() => setFilter('general')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              filter === 'general'
                ? 'bg-primary-soil text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setFilter('emergency')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              filter === 'emergency'
                ? 'bg-primary-soil text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setFilter('project')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              filter === 'project'
                ? 'bg-primary-soil text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            Projects
          </button>
          <button
            onClick={() => setFilter('annual')}
            className={`px-6 py-2 rounded-full font-bold transition-all ${
              filter === 'annual'
                ? 'bg-primary-soil text-white shadow-md'
                : 'bg-white text-charcoal hover:bg-gray-100'
            }`}
          >
            Annual
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        ) : (
          <>
            {/* Featured Campaigns */}
            {featuredCampaigns.length > 0 && (
              <div className="mb-12">
                <h2 className="heading-lg text-charcoal mb-6">Featured Campaigns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Active Campaigns */}
            {activeCampaigns.length > 0 ? (
              <div>
                <h2 className="heading-lg text-charcoal mb-6">
                  {featuredCampaigns.length > 0 ? 'More Campaigns' : 'Active Campaigns'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCampaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="body-lg text-gray-600">No campaigns found.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CampaignCard({ campaign, featured = false }) {
  const progress = Math.min((campaign.amount_raised / campaign.goal_amount) * 100, 100);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/campaigns/${campaign.slug}` : '';

  const handleShare = (platform) => {
    const text = `Support ${campaign.title} - ${campaign.organization_name}`;
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${featured ? 'ring-2 ring-primary-soil' : ''}`}>
      {featured && (
        <div className="bg-primary-soil text-white text-center py-1 text-sm font-bold">
          Featured Campaign
        </div>
      )}

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="heading-sm text-charcoal flex-1">{campaign.title}</h3>
          {campaign.is_matching && (
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full ml-2">
              Matching!
            </span>
          )}
        </div>

        <p className="body-sm text-gray-600 mb-4 line-clamp-3">
          {campaign.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-charcoal">
              {formatCurrency(campaign.amount_raised)}
            </span>
            <span className="text-sm text-gray-600">
              of {formatCurrency(campaign.goal_amount)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-soil to-gradient-green h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}% funded</p>
        </div>

        {/* Impact Metric */}
        {campaign.impact_metric_label && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-green-800 font-medium">
              {campaign.impact_metric_label}
            </p>
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex items-center gap-2 mb-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500 mr-2">Share:</span>
          <button
            onClick={() => handleShare('facebook')}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Share on Facebook"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Share on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            onClick={() => handleShare('linkedin')}
            className="text-gray-400 hover:text-blue-700 transition-colors"
            aria-label="Share on LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/campaigns/${campaign.slug}`}
            className="flex-1 text-center bg-gray-100 text-charcoal py-2 px-4 rounded-lg hover:bg-gray-200 font-bold transition-all text-sm"
          >
            Learn More
          </Link>
          <Link
            href={`/donate?campaign=${campaign.slug}`}
            className="flex-1 text-center bg-primary-soil text-white py-2 px-4 rounded-lg hover:bg-gradient-green font-bold transition-all text-sm shadow-md"
          >
            Donate
          </Link>
        </div>
      </div>
    </div>
  );
}
