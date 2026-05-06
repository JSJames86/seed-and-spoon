import ImpactClient from './ImpactClient';

export const metadata = {
  title: 'Impact Dashboard – Seed & Spoon NJ',
  description:
    'Transparent, real-time impact metrics for Seed & Spoon NJ: meals delivered, youth served, active volunteers, and exactly how every donation dollar is spent.',
  openGraph: {
    title: 'Impact Dashboard – Seed & Spoon NJ',
    description:
      '1,200+ meals delivered, 14 active volunteers, serving 3 Newark-area communities. See how every dollar funds real change.',
    url: 'https://seedandspoon.org/impact',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impact Dashboard – Seed & Spoon NJ',
    description:
      '1,200+ meals delivered, 14 active volunteers, 3 NJ communities served. Full transparency on how donations are used.',
  },
};

export default function ImpactPage() {
  return <ImpactClient />;
}
