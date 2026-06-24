import FAQClient from './FAQClient';

export const metadata = {
  title: 'FAQs – Seed & Spoon',
  description:
    'Answers to common questions about Seed & Spoon: how to receive free meals, donate, volunteer, and more. Serving youth ages 16–25 in Newark, NJ.',
  openGraph: {
    title: 'FAQs – Seed & Spoon',
    description:
      'Answers to common questions about Seed & Spoon: how to receive free meals, donate, volunteer, and more.',
    url: 'https://seedandspoon.org/help',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FAQs – Seed & Spoon',
    description:
      'How to receive meals, donate, and volunteer with Seed & Spoon. Serving at-risk youth in Newark.',
  },
};

export default function HelpPage() {
  return <FAQClient />;
}
