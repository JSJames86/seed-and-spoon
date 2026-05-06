import ContactClient from './ContactClient';

export const metadata = {
  title: 'Research Partnership – Seed & Spoon NJ',
  description:
    'Partner with Seed & Spoon NJ on research into youth food insecurity in Newark. We work with universities, public health institutions, and policy organizations.',
  openGraph: {
    title: 'Research Partnership – Seed & Spoon NJ',
    description:
      'Interested in researching youth hunger in urban New Jersey? Seed & Spoon NJ is building toward research partnerships with academic and policy institutions.',
    url: 'https://seedandspoon.org/contact',
    siteName: 'Seed & Spoon NJ',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
