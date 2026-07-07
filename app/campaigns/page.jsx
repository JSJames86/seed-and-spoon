import CampaignsListClient from '@/components/campaigns/CampaignsListClient';

export const metadata = {
  title: "Fundraising Campaigns | Seed & Spoon NJ",
  description:
    "Support Seed & Spoon NJ's active fundraising campaigns fighting food insecurity in Essex County, New Jersey. Every donation makes a real difference.",
  openGraph: {
    title: "Fundraising Campaigns | Seed & Spoon NJ",
    description:
      "Support Seed & Spoon NJ's active fundraising campaigns fighting food insecurity in Essex County, New Jersey.",
    url: "https://seedandspoon.org/campaigns",
    images: ["/og-image.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fundraising Campaigns | Seed & Spoon NJ",
    description: "Support Seed & Spoon NJ's active fundraising campaigns in Essex County, NJ.",
    images: ["/og-image.jpg"],
  },
};

/**
 * @page
 */
export default function CampaignsPage() {
  return <CampaignsListClient />;
}
