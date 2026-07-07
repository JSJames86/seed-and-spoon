import { notFound } from 'next/navigation';
import { getCampaignBySlug } from '@/lib/campaigns';
import CampaignDetailClient from '@/components/campaigns/CampaignDetailClient';

/**
 * @page
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);
  if (!campaign) return {};

  const title = `${campaign.title} | Seed & Spoon NJ`;
  const description = campaign.description?.slice(0, 200) || `Support ${campaign.title}, a Seed & Spoon NJ fundraising campaign.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://seedandspoon.org/campaigns/${slug}`,
      images: ['/og-image.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}

export default async function CampaignDetailPage({ params }) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) notFound();

  return <CampaignDetailClient campaign={campaign} />;
}
