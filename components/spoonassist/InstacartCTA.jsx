'use client';

// Instacart CTA button — implements the dark variant of Instacart's official
// button design guidelines exactly:
//   Background:  #003D29  |  Text: #FAF1E5  |  Logo: 22px full-color carrot
//   Height: 46px  |  Padding: 16px vertical / 18px horizontal  |  Round corners

function InstacartCarrot({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      {/* Leaves — #0AAD0A */}
      <path d="M11 5.5 C11 5.5 9.5 2 7 2.5 C8.5 3.5 10 5 11 5.5Z"       fill="#0AAD0A" />
      <path d="M11 5.5 C11 5.5 11 1.5 11 0.5 C11 2 11 4 11 5.5Z"         fill="#0AAD0A" />
      <path d="M11 5.5 C11 5.5 12.5 2 15 2.5 C13.5 3.5 12 5 11 5.5Z"    fill="#0AAD0A" />
      {/* Carrot body — #FF7009 */}
      <path
        d="M11 5.5 C7.5 5.5 4.5 8.5 4.5 12 C4.5 16.5 7.5 21.5 11 21.5 C14.5 21.5 17.5 16.5 17.5 12 C17.5 8.5 14.5 5.5 11 5.5Z"
        fill="#FF7009"
      />
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
