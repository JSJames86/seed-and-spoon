import CareersClient from './CareersClient';

export const metadata = {
  title: 'Careers – Seed & Spoon NJ',
  description:
    'No openings right now, but we are always growing. Submit your resume for future roles at Seed & Spoon NJ including case managers, researchers, grant writers, cooks, and more.',
  openGraph: {
    title: 'Careers – Seed & Spoon NJ',
    description:
      'Join the team fighting youth food insecurity in Newark. Submit your interest for future openings at Seed & Spoon NJ.',
    url: 'https://seedandspoon.org/careers',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
};

export default function CareersPage() {
  return <CareersClient />;
}
