import ReportsClient from './ReportsClient';

export const metadata = {
  title: 'Research & Reports – Seed & Spoon NJ',
  description:
    'Data, studies, and policy reports on youth hunger and food insecurity in Newark and New Jersey. Curated by Seed & Spoon NJ.',
  openGraph: {
    title: 'Research & Reports – Seed & Spoon NJ',
    description:
      'Curated research on youth hunger, food insecurity, and community nutrition in Newark and New Jersey.',
    url: 'https://seedandspoon.org/resources/reports',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
};

export default function ReportsPage() {
  return <ReportsClient />;
}
