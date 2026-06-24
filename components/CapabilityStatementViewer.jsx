'use client';

import { useState } from 'react';

const PDF_URL = 'https://seedandspoon.org/documents/seed-and-spoon-capability-statement.pdf';
const PDF_PATH = '/documents/seed-and-spoon-capability-statement.pdf';
const DOWNLOAD_NAME = 'Seed-and-Spoon-Capability-Statement.pdf';
const GDOCS_VIEWER = `https://docs.google.com/viewer?url=${encodeURIComponent(PDF_URL)}&embedded=true`;

export default function CapabilityStatementViewer({ compact = false }) {
  const [isOpen, setIsOpen] = useState(false);

  if (compact) {
    return (
      <a
        href={PDF_PATH}
        download={DOWNLOAD_NAME}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[var(--green-primary)] hover:underline underline-offset-4 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Capability Statement (PDF)
      </a>
    );
  }

  return (
    <section className="w-full" aria-label="Capability Statement">
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--green-primary)] text-white rounded-lg font-medium hover:bg-[var(--leaf-mid)] transition-colors"
          aria-expanded={isOpen}
          aria-controls="capability-pdf-frame"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {isOpen ? 'Hide' : 'View'} Capability Statement
        </button>

        <a
          href={PDF_PATH}
          download={DOWNLOAD_NAME}
          className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-[var(--green-primary)] text-[var(--green-primary)] rounded-lg font-medium hover:bg-green-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </a>
      </div>

      {isOpen && (
        <div
          id="capability-pdf-frame"
          className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-md"
        >
          <iframe
            src={GDOCS_VIEWER}
            className="w-full"
            style={{ height: '800px' }}
            title="Seed & Spoon Capability Statement"
            allow="autoplay"
          />
        </div>
      )}
    </section>
  );
}
