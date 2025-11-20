'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchOrganizations();
    fetchCampaigns();
  }, [selectedOrg, selectedType]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/organizations`);
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/campaigns?`;
      if (selectedOrg !== 'all') {
        url += `organization=${selectedOrg}&`;
      }
      if (selectedType !== 'all') {
        url += `type=${selectedType}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calculateProgress = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            Support Our Campaigns
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Every donation helps us rescue food, feed families, and build a sustainable food system in Essex County
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="org-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Organization
              </label>
              <select
                id="org-filter"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil"
              >
                <option value="all">All Organizations</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-soil focus:border-primary-soil"
              >
                <option value="all">All Types</option>
                <option value="general">General Support</option>
                <option value="project">Specific Project</option>
                <option value="emergency">Emergency Relief</option>
                <option value="matching">Matching Campaign</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-soil"></div>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && campaigns.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No campaigns found matching your filters.</p>
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => {
              const progress = calculateProgress(campaign.amount_raised, campaign.goal_amount);
              
              return (
                <Link
                  key={campaign.id}
                  href={`/campaigns/${campaign.slug}`}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Campaign Image */}
                  {campaign.featured_image ? (
                    <div className="relative h-48 w-full">
                      <Image
                        src={campaign.featured_image}
                        alt={campaign.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      <span className="text-4xl">🌱</span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Campaign Type Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 text-xs font-semibold text-white bg-primary-soil rounded-full">
                        {campaign.campaign_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {campaign.is_matching && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          🎁 MATCHING
                        </span>
                      )}
                    </div>

                    {/* Campaign Title */}
                    <h3 className="text-xl font-bold text-charcoal mb-2 line-clamp-2">
                      {campaign.title}
                    </h3>

                    {/* Campaign Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {campaign.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-charcoal">
                          {formatCurrency(campaign.amount_raised)}
                        </span>
                        <span className="text-gray-600">
                          of {formatCurrency(campaign.goal_amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-soil h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{Math.round(progress)}% funded</span>
                        <span>{campaign.donor_count} donors</span>
                      </div>
                    </div>

                    {/* Impact Metric */}
                    {campaign.impact_metric_label && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-green-800">
                          <strong>Impact:</strong> {campaign.impact_metric_label}
                        </p>
                      </div>
                    )}

                    {/* CTA Button */}
                    <button className="w-full bg-primary-soil text-white py-2 px-4 rounded-md hover:bg-gradient-green font-semibold transition-colors">
                      View Campaign & Donate
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
