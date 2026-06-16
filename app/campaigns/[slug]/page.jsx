import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Thermometer } from '@/components/campaign/Thermometer';
import CampaignDonateForm from '@/components/campaign/CampaignDonateForm';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://seedandspoon.org';

async function getCampaign(slug) {
  try {
    const res = await fetch(`${SITE_URL}/api/campaigns/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.ok ? json.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);
  if (!campaign) return { title: 'Campaign Not Found' };

  const description = `Help us raise $${(campaign.goal_cents / 100).toLocaleString()} for ${campaign.title}. ${campaign.percent}% funded — every dollar counts. Seed and Spoon Incorporated is a nonprofit with 501(c)(3) status pending; contributions are not currently tax-deductible.`;

  return {
    title: `${campaign.title} | Seed & Spoon NJ`,
    description,
    openGraph: {
      title: `${campaign.title} — Help us reach $${(campaign.goal_cents / 100).toLocaleString()}`,
      description,
      url: `${SITE_URL}/campaigns/${slug}`,
      images: campaign.hero_image_url ? [campaign.hero_image_url] : ['/og-default.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${campaign.title} — ${campaign.percent}% funded`,
      description,
      images: campaign.hero_image_url ? [campaign.hero_image_url] : ['/og-default.jpg'],
    },
  };
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function daysLeft(deadline) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export default async function CampaignPage({ params }) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) notFound();

  const days = daysLeft(campaign.deadline);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      {campaign.hero_image_url ? (
        <div
          className="h-64 md:h-80 w-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${campaign.hero_image_url})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-end">
            <div className="max-w-4xl mx-auto w-full px-4 pb-8">
              <Link href="/campaigns" className="inline-flex items-center text-white/80 hover:text-white text-sm mb-3">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                All campaigns
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{campaign.title}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-primary-soil to-gradient-green py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/campaigns" className="inline-flex items-center text-cream/80 hover:text-cream text-sm mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All campaigns
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-cream drop-shadow-lg">{campaign.title}</h1>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: story */}
          <div className="lg:col-span-3 space-y-6">
            {campaign.story && (
              <div className="bg-white rounded-2xl shadow-card p-8">
                <h2 className="text-xl font-bold text-charcoal mb-4">About this campaign</h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">{campaign.story}</div>
              </div>
            )}

            {campaign.inkind_cents > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-sm text-green-800">
                <span className="font-semibold">Plus ${(campaign.inkind_cents / 100).toLocaleString()} in donated food &amp; supplies</span>
                {' '}— valued separately and not included in the progress bar.
              </div>
            )}

            {campaign.status === 'closed' || campaign.status === 'ended' ? (
              <div className="bg-primary-soil/10 border border-primary-soil/20 rounded-2xl p-6 text-center">
                <p className="font-bold text-primary-soil text-lg">This campaign has closed — thank you!</p>
                <p className="text-gray-600 mt-1 text-sm">Past campaigns stay visible as proof of community support.</p>
              </div>
            ) : null}
          </div>

          {/* Right: thermometer + donate form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24 space-y-6">
              {/* Thermometer */}
              <div>
                <Thermometer cashCents={campaign.cash_cents} goalCents={campaign.goal_cents} />
              </div>

              {/* Stats row */}
              <div className="flex gap-4 text-sm text-gray-600 border-t border-gray-100 pt-4">
                {campaign.donor_count > 0 && (
                  <div>
                    <span className="font-bold text-charcoal text-base">{campaign.donor_count}</span> donors
                  </div>
                )}
                {days !== null && campaign.status === 'active' && (
                  <div>
                    <span className="font-bold text-charcoal text-base">{days}</span> days left
                  </div>
                )}
                {campaign.deadline && campaign.status === 'active' && (
                  <div className="ml-auto text-xs text-gray-400">by {formatDate(campaign.deadline)}</div>
                )}
              </div>

              {/* Donate form — only when campaign is active */}
              {campaign.status === 'active' ? (
                <CampaignDonateForm campaignSlug={campaign.slug} />
              ) : (
                <Link
                  href="/donate"
                  className="block w-full text-center bg-primary-soil text-white py-4 rounded-xl font-bold hover:bg-gradient-green transition-all"
                >
                  Make a General Donation
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
