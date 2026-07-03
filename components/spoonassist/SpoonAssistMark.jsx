// The SpoonAssist brand mark (spoon + sprout, matching public/spoonassist/
// icon.png) as an inline, single-color SVG. Inline (rather than the PNG) so
// it can take the current text color and be dropped to a low opacity as a
// decorative watermark -- used by EmptyState and RecipePlaceholder, always
// with aria-hidden since it's decorative, never informational.
export default function SpoonAssistMark({ size = 96, className = '' }) {
  // `size` accepts a number (px) or any CSS length ("40%") so callers can
  // size the mark relative to a variable-size container (e.g. RecipePlaceholder).
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M32 20c-7.5 0-13 6-13 14 0 6.6 5.1 11.9 11.5 12.4V54a1.5 1.5 0 003 0V46.4C39.9 45.9 45 40.6 45 34c0-8-5.5-14-13-14Z"
        fill="currentColor"
      />
      <path
        d="M31 21c-2-6-8-9-14-8 1 5.5 5.5 9.7 11.2 10 .9-.7 1.8-1.4 2.8-2Z"
        fill="currentColor"
      />
      <path
        d="M33 21c2-6 8-9 14-8-1 5.5-5.5 9.7-11.2 10-.9-.7-1.8-1.4-2.8-2Z"
        fill="currentColor"
      />
    </svg>
  );
}
