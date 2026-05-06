import FAQClient from './FAQClient';

export const metadata = {
  title: 'FAQs – Seed & Spoon NJ',
  description:
    'Answers to common questions about Seed & Spoon NJ: how to receive free meals, donate, volunteer, and more. Serving youth ages 16–25 in Newark, NJ.',
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
      'How to receive meals, donate, and volunteer with Seed & Spoon NJ. Serving at-risk youth in Newark.',
  },
};

export default function HelpPage() {
  return <FAQClient />;
}
