import AffiliateClient from './AffiliateClient';

export const metadata = {
  title: 'Become an Affiliate – Seed & Spoon NJ',
  description:
    "Join the Seed & Spoon NJ affiliate program. Spread the word, drive donations, and help feed at-risk youth in Newark — we'll give you everything you need.",
  openGraph: {
    title: 'Become an Affiliate – Seed & Spoon NJ',
    description:
      "Become a Seed & Spoon affiliate and help end youth hunger in Newark. Get a personal referral link, branded kit, and monthly impact reports.",
    url: 'https://seedandspoon.org/affiliate',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Become an Affiliate – Seed & Spoon NJ',
    description:
      "Use your platform to fight youth hunger in Newark. Join the Seed & Spoon affiliate program today.",
  },
};

export default function AffiliatePage() {
  return <AffiliateClient />;
}
