'use client';

const STATUS_STYLES = {
  ok:            { label: 'OK',            className: 'bg-spoon-mint-tint text-spoon-mint' },
  no_price:      { label: 'No price yet',  className: 'bg-red-50 text-red-700' },
  no_conversion: { label: 'No conversion', className: 'bg-amber-50 text-spoon-warning' },
};

export function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.no_price;
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap ${style.className}`}>
      {style.label}
    </span>
  );
}

export function ConfidencePill({ confidence }) {
  if (!confidence) return null;
  const isEstimate = confidence === 'estimated';
  return (
    <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${isEstimate ? 'bg-amber-50 text-spoon-warning' : 'bg-white/60 text-spoon-subtext'}`}>
      {isEstimate ? 'Est.' : 'Exact'}
    </span>
  );
}
