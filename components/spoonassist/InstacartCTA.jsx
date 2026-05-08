'use client';

// Instacart CTA button — implements the dark variant of Instacart's official
// button design guidelines exactly:
//   Background:  #003D29  |  Text: #FAF1E5  |  Logo: 22px full-color carrot
//   Height: 46px  |  Padding: 16px vertical / 18px horizontal  |  Round corners

// Instacart carrot icon — traced from official brand asset.
// Shape: rounded circle cap → vertical stem → two curved side lobes
// all converging to a downward V-point, with orange semicircle body below.
function InstacartCarrot({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" aria-hidden="true">
      {/* Circle cap at top of stem */}
      <circle cx="50" cy="16" r="14" fill="#0AAD0A" />
      {/* Stem + two wings converging to downward V */}
      <path
        d="M36 16 L36 38
           C24 36 4 42 4 56
           C4 66 18 74 50 74
           C82 74 96 66 96 56
           C96 42 76 36 64 38
           L64 16 Z"
        fill="#0AAD0A"
      />
      {/* Orange semicircle body */}
      <path d="M4 88 A46 46 0 0 0 96 88 Z" fill="#FF7009" />
    </svg>
  );
}

// "instacart" wordmark in brand cream color — used inside the dark button.
// Approximates Instacart's rounded sans-serif wordmark lettering.
function InstacartWordmark({ height = 16 }) {
  return (
    <span
      style={{
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontWeight: 700,
        fontSize: height,
        letterSpacing: '-0.02em',
        color: '#FAF1E5',
        lineHeight: 1,
      }}
    >
      instacart
    </span>
  );
}

export default function InstacartCTA({ onClick, loading = false, disabled = false, text = 'Shop ingredients' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ backgroundColor: '#003D29', height: '46px' }}
      className="
        inline-flex items-center gap-[10px]
        px-[18px]
        rounded-full
        transition-opacity
        hover:opacity-90
        disabled:opacity-40 disabled:cursor-not-allowed
        select-none whitespace-nowrap
      "
      aria-label={loading ? 'Creating Instacart shopping list…' : `${text} on Instacart`}
    >
      <InstacartCarrot size={22} />
      <InstacartWordmark height={15} />
      {/* Divider */}
      <span style={{ width: 1, height: 20, backgroundColor: '#FAF1E520', flexShrink: 0 }} />
      <span style={{ color: '#FAF1E5', fontSize: 14, fontWeight: 600 }}>
        {loading ? 'Creating list…' : text}
      </span>
    </button>
  );
}
