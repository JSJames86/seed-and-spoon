'use client';

// ---------------------------------------------------------------------------
// Data partner definitions
// Add a new entry here when a new API is integrated.
// ---------------------------------------------------------------------------

const PARTNERS = {
  kroger: {
    label:   'Powered by Kroger',
    href:    'https://www.kroger.com',
    bg:      'bg-[#00539F]',
    text:    'text-white',
    border:  'border-[#003F7A]',
    // Kroger wordmark using brand colors — swap for <img> once logo asset is approved
    logo: (
      <svg viewBox="0 0 64 20" className="h-4 w-auto fill-white" aria-hidden="true">
        <text x="0" y="16" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold">Kroger</text>
      </svg>
    ),
  },
  usda: {
    label:   'USDA Price Data',
    href:    'https://www.usda.gov',
    bg:      'bg-[#154734]',
    text:    'text-white',
    border:  'border-[#0D3024]',
    logo: (
      <svg viewBox="0 0 52 20" className="h-4 w-auto fill-white" aria-hidden="true">
        <text x="0" y="15" fontFamily="Arial, sans-serif" fontSize="13" fontWeight="bold" letterSpacing="1">USDA</text>
      </svg>
    ),
  },
  instacart: {
    label:   'Instacart®',   // ® required by Instacart trademark guidelines
    href:    'https://www.instacart.com',
    bg:      'bg-[#003D29]',
    text:    'text-[#FAF1E5]',
    border:  'border-[#003D29]',
    logo: (
      <svg width="14" height="14" viewBox="0 0 100 120" fill="none" aria-hidden="true">
        <circle cx="50" cy="16" r="14" fill="#0AAD0A"/>
        <path d="M36 16 L36 38 C24 36 4 42 4 56 C4 66 18 74 50 74 C82 74 96 66 96 56 C96 42 76 36 64 38 L64 16Z" fill="#0AAD0A"/>
        <path d="M4 88 A46 46 0 0 0 96 88Z" fill="#FF7009"/>
      </svg>
    ),
  },
  community: {
    label:   'Community Prices',
    href:    null,
    bg:      'bg-teal-700',
    text:    'text-white',
    border:  'border-teal-900',
    logo:    null,
  },
};

// ---------------------------------------------------------------------------
// Single badge
// ---------------------------------------------------------------------------

function Badge({ partnerKey }) {
  const p = PARTNERS[partnerKey];
  if (!p) return null;

  const inner = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${p.bg} ${p.text} ${p.border}`}
    >
      {p.logo}
      <span>{p.label}</span>
    </span>
  );

  return p.href
    ? <a href={p.href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">{inner}</a>
    : inner;
}

// ---------------------------------------------------------------------------
// Public: PoweredBy
//
// Props:
//   sources  — array of active source keys, e.g. ['kroger', 'usda']
//   compact  — true = row of small inline badges; false (default) = labeled section
// ---------------------------------------------------------------------------

export default function PoweredBy({ sources = [], compact = false }) {
  const active = sources.filter(k => PARTNERS[k]);
  if (!active.length) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {active.map(k => <Badge key={k} partnerKey={k} />)}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="text-xs text-gray-500 font-medium">Price data powered by</span>
      {active.map(k => <Badge key={k} partnerKey={k} />)}
    </div>
  );
}
