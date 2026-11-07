export default function CampaignProgress({ headline, subline, ariaLabel, valueNow, valueMax, pct, pctLabel, marker, footnote }) {
  const clamped = Math.max(0, Math.min(100, pct || 0));
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <p className="text-2xl md:text-3xl font-bold text-[#02538A]">{headline}</p>
      {subline && <p className="mt-1 text-sm text-gray-600">{subline}</p>}

      <div className={`relative ${marker ? 'mt-8' : 'mt-5'} mb-2`}>
        {marker && (
          <div
            className="absolute -top-7 -translate-x-1/2 text-xs font-semibold text-[#EA802F] whitespace-nowrap"
            style={{ left: `${marker.pct}%` }}
          >
            {marker.label}
          </div>
        )}
        <div
          role="progressbar"
          aria-label={ariaLabel}
          aria-valuemin={0}
          aria-valuemax={valueMax}
          aria-valuenow={valueNow}
          aria-valuetext={headline}
          className="relative h-4 w-full rounded-full bg-gray-200 overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#77A462] to-[#0B88C2]"
            style={{ width: `${clamped}%`, minWidth: clamped > 0 ? '0.5rem' : 0 }}
          />
        </div>
        {marker && (
          <div aria-hidden className="absolute -top-1 h-6 w-0.5 bg-[#EA802F]" style={{ left: `${marker.pct}%` }} />
        )}
      </div>
      <p className="text-xs text-gray-500 text-right">{Math.round(clamped)}%{pctLabel ? ` ${pctLabel}` : ''}</p>
      {footnote && <p className="mt-3 text-xs text-gray-500">{footnote}</p>}
    </div>
  );
}
