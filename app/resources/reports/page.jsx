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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    name: 'Modernizing Hunger Relief: Technology, Infrastructure, and the Future of Youth Food Security',
    author: {
      '@type': 'Person',
      name: 'Janelle Glanville',
      affiliation: {
        '@type': 'Organization',
        name: 'Seed and Spoon, Incorporated',
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'Seed and Spoon',
      url: 'https://seedandspoon.org',
    },
    datePublished: '2026',
    identifier: 'https://doi.org/10.5281/zenodo.20299779',
    url: 'https://seedandspoon.org/research',
    license: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    keywords: 'youth food insecurity, food systems, SNAP, community food infrastructure, Newark',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReportsClient />
    </>
  );
}
