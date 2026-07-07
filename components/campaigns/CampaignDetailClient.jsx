'use client';

import Link from 'next/link';

/**
 * CampaignDetailClient
 *
 * Client-side interactivity (share buttons, currency/date formatting) for a
 * single campaign. Receives the campaign fetched server-side as a prop from
 * app/campaigns/[slug]/page.jsx, which owns the `generateMetadata` export.
 *
 * @component
 * @param {Object} props
 * @param {Object} props.campaign
 */
export default function CampaignDetailClient({ campaign }) {
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://seedandspoon.org/campaigns/${campaign.slug}`;

  const handleShare = (platform) => {
    const text = `Support ${campaign.title} - ${campaign.organization_name}`;
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(campaign.title)}&body=${encodeURIComponent(text + ' ' + shareUrl)}`,
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

  const progress = Math.min((campaign.amount_raised / campaign.goal_amount) * 100, 100);
  const daysLeft = campaign.end_date
    ? Math.max(0, Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="bg-gradient-to-br from-primary-soil to-gradient-green py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/campaigns" className="inline-flex items-center text-cream/80 hover:text-cream mb-4 text-sm drop-shadow-md">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </Link>
          <h1 className="heading-xl mb-3 text-cream drop-shadow-lg">{campaign.title}</h1>
          <p className="body-md mb-4 text-cream/90 drop-shadow-md">by {campaign.organization_name}</p>
          {campaign.is_matching && (
            <div className="inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              🎉 Matching Donations Available!
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="heading-md text-charcoal mb-4">About This Campaign</h2>
              <p className="body-md text-gray-700 whitespace-pre-line">{campaign.description}</p>
            </div>

            {campaign.impact_metric_label && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="heading-md text-charcoal mb-4">Your Impact</h2>
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <p className="text-green-900 font-bold text-lg mb-2">{campaign.impact_metric_label}</p>
                  <p className="text-green-700">
                    Every ${campaign.impact_metric_amount} provides {campaign.impact_metric_value} {campaign.impact_metric_label}
                  </p>
                </div>
              </div>
            )}

            {campaign.is_matching && campaign.matching_sponsor && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="heading-md text-charcoal mb-4">Matching Donation</h2>
                <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                  <p className="text-orange-900 font-bold text-lg mb-2">Double Your Impact!</p>
                  <p className="text-orange-700 mb-2">
                    Thanks to {campaign.matching_sponsor}, all donations will be matched up to {formatCurrency(campaign.matching_amount)}!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <div className="mb-6">
                <div className="text-3xl font-bold text-charcoal mb-2">{formatCurrency(campaign.amount_raised)}</div>
                <div className="text-sm text-gray-600 mb-4">raised of {formatCurrency(campaign.goal_amount)} goal</div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                  <div
                    className="bg-gradient-to-r from-primary-soil to-gradient-green h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-right text-sm text-gray-600">{Math.round(progress)}% funded</div>
              </div>

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

              <Link
                href={`/donate?campaign=${campaign.slug}`}
                className="block w-full text-center bg-primary-soil text-white py-4 px-6 rounded-lg hover:bg-gradient-green font-bold transition-all text-lg shadow-lg hover:shadow-xl mb-4"
              >
                Donate Now
              </Link>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-charcoal mb-3">Share This Campaign</h3>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { platform: 'facebook', label: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700' },
                    { platform: 'twitter', label: 'Twitter', color: 'bg-blue-400 hover:bg-blue-500' },
                    { platform: 'linkedin', label: 'LinkedIn', color: 'bg-blue-700 hover:bg-blue-800' },
                    { platform: 'email', label: 'Email', color: 'bg-gray-600 hover:bg-gray-700' },
                  ].map(({ platform, label, color }) => (
                    <button
                      key={platform}
                      onClick={() => handleShare(platform)}
                      className={`flex items-center justify-center gap-2 ${color} text-white py-2 px-4 rounded-lg transition-all text-sm`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center justify-center gap-2 bg-gray-100 text-charcoal py-2 px-4 rounded-lg hover:bg-gray-200 transition-all text-sm font-medium"
                >
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
