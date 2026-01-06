'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    organization: '',
    title: '',
    slug: '',
    description: '',
    campaign_type: 'general',
    goal_amount: '',
    start_date: '',
    end_date: '',
    is_featured: false,
    is_matching: false,
    matching_sponsor: '',
    matching_amount: '',
    impact_metric_label: '',
    impact_metric_value: '',
    impact_metric_amount: '',
  });

  // TODO: Migrate to Supabase - currently uses legacy API endpoints
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/api/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      // Prepare data
      const submitData = {
        ...formData,
        goal_amount: parseFloat(formData.goal_amount),
        matching_amount: formData.matching_amount ? parseFloat(formData.matching_amount) : null,
        impact_metric_value: formData.impact_metric_value ? parseFloat(formData.impact_metric_value) : null,
        impact_metric_amount: formData.impact_metric_amount ? parseFloat(formData.impact_metric_amount) : null,
      };

      const response = await fetch(`${API_URL}/api/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        const campaign = await response.json();
        alert('Campaign created successfully!');
        router.push(`/campaigns/${campaign.slug}`);
      } else {
        const error = await response.json();
        alert(`Error: ${JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-charcoal mb-8">
            Create New Campaign
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Organization *
              </label>
              <select
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
              >
                <option value="">Select an organization</option>
                {organizations.map(org => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                placeholder="e.g., Summer Food Drive 2024"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                URL Slug *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil bg-gray-50"
                placeholder="auto-generated-from-title"
              />
              <p className="mt-1 text-xs text-gray-500">
                Campaign will be accessible at: /campaigns/{formData.slug || 'your-slug'}
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                placeholder="Describe your campaign goals, impact, and why donors should contribute..."
              />
            </div>

            {/* Campaign Type */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Campaign Type *
              </label>
              <select
                name="campaign_type"
                value={formData.campaign_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
              >
                <option value="general">General</option>
                <option value="emergency">Emergency</option>
                <option value="project">Project</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {/* Goal Amount */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Fundraising Goal ($) *
              </label>
              <input
                type="number"
                name="goal_amount"
                value={formData.goal_amount}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                placeholder="10000.00"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-soil focus:ring-primary-soil border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-charcoal">
                  Feature this campaign on homepage
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_matching"
                  checked={formData.is_matching}
                  onChange={handleChange}
                  className="w-5 h-5 text-primary-soil focus:ring-primary-soil border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-charcoal">
                  Enable matching donations
                </span>
              </label>
            </div>

            {/* Matching Details */}
            {formData.is_matching && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-orange-900">Matching Donation Details</h3>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Matching Sponsor Name
                  </label>
                  <input
                    type="text"
                    name="matching_sponsor"
                    value={formData.matching_sponsor}
                    onChange={handleChange}
                    maxLength={200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                    placeholder="ABC Corporation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Maximum Matching Amount ($)
                  </label>
                  <input
                    type="number"
                    name="matching_amount"
                    value={formData.matching_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                    placeholder="5000.00"
                  />
                </div>
              </div>
            )}

            {/* Impact Metrics */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-green-900">Impact Metrics (Optional)</h3>
              <p className="text-sm text-green-800">
                Show donors the tangible impact of their contribution
              </p>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Impact Label
                </label>
                <input
                  type="text"
                  name="impact_metric_label"
                  value={formData.impact_metric_label}
                  onChange={handleChange}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                  placeholder="e.g., meals provided"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Impact Value
                  </label>
                  <input
                    type="number"
                    name="impact_metric_value"
                    value={formData.impact_metric_value}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal mb-2">
                    Per Dollar Amount
                  </label>
                  <input
                    type="number"
                    name="impact_metric_amount"
                    value={formData.impact_metric_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-soil"
                    placeholder="50"
                  />
                </div>
              </div>

              <p className="text-xs text-green-700">
                Example: $50 provides 10 meals → shows "$50 = 10 meals"
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-charcoal hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-soil text-white py-3 px-6 rounded-lg hover:bg-gradient-green font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-soil/50"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
