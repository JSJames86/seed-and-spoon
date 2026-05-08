'use client';

// Instacart CTA button — implements the dark variant of Instacart's official
// button design guidelines exactly:
//   Background:  #003D29  |  Text: #FAF1E5  |  Logo: 22px full-color carrot
//   Height: 46px  |  Padding: 16px vertical / 18px horizontal  |  Round corners

function InstacartCarrot({ size = 22 }) {
  // Traced from Instacart's official brand asset:
  // Three rounded prongs (ψ-shape) in green converging to a center point,
  // with an orange semicircle body below.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 130"
      fill="none"
      aria-hidden="true"
    >
      {/* Green three-pronged leaves */}
      <path
        d="M50 4
           C54.4 4 58 7.6 58 12
           L58 36
           C66 31 80 31 88 40
           C96 49 94 62 84 68
           C76 73 64 71 50 62
           C36 71 24 73 16 68
           C6 62 4 49 12 40
           C20 31 34 31 42 36
           L42 12
           C42 7.6 45.6 4 50 4Z"
        fill="#0AAD0A"
      />
      {/* Orange semicircle body */}
      <path d="M10 90 A40 40 0 0 0 90 90Z" fill="#FF7009" />
    </svg>
  );
}

export default function InstacartCTA({ onClick, loading = false, disabled = false, text = 'Shop ingredients' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ backgroundColor: '#003D29', color: '#FAF1E5', height: '46px' }}
      className="
        inline-flex items-center gap-2
        px-[18px]
        rounded-full
        font-semibold text-sm
        transition-opacity
        hover:opacity-90
        disabled:opacity-40 disabled:cursor-not-allowed
        select-none whitespace-nowrap
      "
      aria-label={loading ? 'Creating Instacart shopping list…' : text}
    >
      <InstacartCarrot size={22} />
      <span>{loading ? 'Creating list…' : text}</span>
    </button>
  );
}
