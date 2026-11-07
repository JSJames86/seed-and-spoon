import CommunityPartnersClient from './CommunityPartnersClient';

export const metadata = {
  title: 'Community Partnerships – Seed & Spoon',
  description:
    'Schools, agencies, universities, municipalities, and faith and community groups: choose one clear way to help Seed & Spoon feed Newark children.',
  openGraph: {
    title: 'Community Partnerships – Seed & Spoon',
    description:
      'Schools, agencies, universities, municipalities, and faith and community groups: choose one clear way to help Seed & Spoon feed Newark children.',
    url: 'https://seedandspoon.org/partners/community',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

export default function CommunityPartnersPage() {
  return <CommunityPartnersClient />;
}
