'use client';

// Instacart CTA button — implements the dark variant of Instacart's official
// button design guidelines exactly:
//   Background:  #003D29  |  Text: #FAF1E5  |  Logo: 22px full-color carrot
//   Height: 46px  |  Padding: 16px vertical / 18px horizontal  |  Round corners

// Instacart carrot icon — exact path data from Instacart's official brand
// asset pack (Logos - Carrot/RGB/SVG/Instacart_Carrot.svg).
function InstacartCarrot({ size = 22 }) {
  return (
    <svg width={size} height={size * (52.9 / 42.3)} viewBox="0 0 42.3 52.9" aria-hidden="true">
      <path
        fill="#0AAD0A"
        d="M36.4,8.6c-2.3,0-4,1-5.5,3.2l-4.4,6.4V0H15.9v18.2l-4.4-6.4C9.9,9.6,8.2,8.6,5.9,8.6C2.4,8.6,0,11.2,0,14.4
           c0,2.7,1.3,4.5,4,6.3l17.1,11l17.1-11c2.7-1.8,4-3.5,4-6.3C42.3,11.2,39.9,8.6,36.4,8.6z"
      />
      <path
        fill="#FF7009"
        d="M21.1,34.4c10.2,0,18.5,7.6,18.5,18.5h-37C2.6,42,11,34.4,21.1,34.4z"
      />
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
      aria-label={loading ? 'Creating Instacart shopping list…' : `${text} via Instacart`}
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
