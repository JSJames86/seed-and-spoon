import FAQClient from './FAQClient';

export const metadata = {
  title: 'FAQs – Seed & Spoon NJ',
  description:
    'Answers to common questions about Seed & Spoon NJ: how to receive free meals, donate, volunteer, and more. Serving children under 18 and their families in Newark and Essex County, NJ.',
  openGraph: {
    title: 'FAQs – Seed & Spoon NJ',
    description:
      'Answers to common questions about Seed & Spoon NJ: how to receive free meals, donate, volunteer, and more.',
    url: 'https://seedandspoon.org/help',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs – Seed & Spoon NJ',
    description:
      'How to receive meals, donate, and volunteer with Seed & Spoon NJ. Serving children and families in Newark and Essex County.',
  },
};

export default function HelpPage() {
  return <FAQClient />;
}
