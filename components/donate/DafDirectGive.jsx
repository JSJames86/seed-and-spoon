'use client';

import Script from 'next/script';
import { captureEvent } from '@/analytics/posthog';
import {
  DAF_DIRECT_LINK,
  DAF_DIRECT_WIDGET,
  DAF_SPONSORS_SUPPORTED,
} from '@/data/dafGiving';

/**
 * DAF Direct entry point. Renders the embedded widget when DAF_DIRECT_WIDGET
 * is configured; otherwise a button that opens the DAF Direct link. The
 * third-party script only ever loads on /daf-giving.
 */
export default function DafDirectGive() {
  const handleClick = () => {
    captureEvent('daf_direct_clicked', { placement: 'daf_giving_page' });
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
        Recommend a Grant
      </h2>
      <p className="text-gray-700 mb-2 leading-relaxed">
        Works with accounts at:
      </p>
      <ul className="flex flex-wrap justify-center gap-2 mb-8">
        {DAF_SPONSORS_SUPPORTED.map((s) => (
          <li
            key={s}
            className="bg-green-50 border border-green-200 rounded-full px-4 py-1 text-sm font-semibold text-green-800"
          >
            {s}
          </li>
        ))}
      </ul>

      {DAF_DIRECT_WIDGET ? (
        <>
          <div id={DAF_DIRECT_WIDGET.containerId} className="mx-auto max-w-md" />
          <Script src={DAF_DIRECT_WIDGET.scriptSrc} strategy="lazyOnload" />
        </>
      ) : (
        <a
          href={DAF_DIRECT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-lg bg-green-600 text-white hover:bg-green-700 transition-all shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          {/* Official DAF Direct badge (30x30, supplied with the DAF Direct link kit) */}
          <img
            src="/images/daf/daf-direct-icon.jpg"
            alt=""
            width={30}
            height={30}
            className="rounded"
          />
          Recommend a DAF Grant
          <span className="sr-only"> (opens DAF Direct in a new tab)</span>
        </a>
      )}

      <p className="mt-6 text-sm text-gray-500">
        You will sign in to your DAF account to finish your grant. Seed &amp; Spoon never
        sees your account details.
      </p>
    </div>
  );
}
