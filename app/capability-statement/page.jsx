import CapabilityStatementViewer from '@/components/CapabilityStatementViewer';

export const metadata = {
  title: 'Capability Statement | Seed & Spoon',
  description:
    'Download or view the Seed & Spoon Capability Statement. Learn about our NAICS codes, certifications, core competencies, and past performance.',
  openGraph: {
    title: 'Capability Statement | Seed & Spoon',
    description:
      'Download or view the Seed & Spoon Capability Statement. NAICS codes, certifications, and past performance for partners and funding agencies.',
    url: 'https://seedandspoon.org/capability-statement',
    siteName: 'Seed & Spoon',
    type: 'website',
  },
};

export default function CapabilityStatementPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 pt-24 md:pt-28">
      <div className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--green-primary)] mb-2">
          Official Document
        </p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Capability Statement
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          Seed &amp; Spoon is a New Jersey-based nonprofit addressing youth food insecurity.
          Our capability statement outlines our core competencies, NAICS codes, certifications,
          and past performance for partners and funding agencies.
        </p>
      </div>

      <CapabilityStatementViewer />
    </div>
  );
}
