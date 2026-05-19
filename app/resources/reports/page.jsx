import ReportsClient from './ReportsClient';

export const metadata = {
  title: 'Youth Food Insecurity White Paper | Seed & Spoon',
  description:
    "Read Seed & Spoon's 2026 white paper on youth food insecurity in the U.S. — infrastructure failures, SNAP cuts, and technology-driven solutions for communities.",
  openGraph: {
    title: 'Modernizing Hunger Relief — A White Paper by Seed & Spoon',
    description:
      '14.1 million children in food-insecure households. This paper argues hunger is an infrastructure problem — and technology already exists to fix it.',
    url: 'https://seedandspoon.org/research',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Modernizing Hunger Relief — A White Paper by Seed & Spoon',
    description:
      '14.1 million children in food-insecure households. This paper argues hunger is an infrastructure problem — and technology already exists to fix it.',
  },
  keywords: [
    'youth food insecurity',
    'child hunger United States',
    'food system infrastructure',
    'SNAP cuts impact children',
    'Newark food access',
    'food insecurity white paper',
    'community food systems',
  ],
};

export default function ReportsPage() {
  return <ReportsClient />;
}
