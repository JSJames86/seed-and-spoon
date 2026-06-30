import CommunityPartnersClient from './CommunityPartnersClient';

export const metadata = {
  title: 'Community Partnerships – Seed & Spoon',
  description:
    'Partner with Seed & Spoon as a church, community center, youth group, or educational institution to help Essex County families access food with dignity.',
  openGraph: {
    title: 'Community Partnerships – Seed & Spoon',
    description:
      'Partner with Seed & Spoon as a church, community center, youth group, or educational institution to help Essex County families access food with dignity.',
    url: 'https://seedandspoon.org/partners/community',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

export default function CommunityPartnersPage() {
  return <CommunityPartnersClient />;
}
