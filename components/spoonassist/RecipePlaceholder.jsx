import SpoonAssistMark from './SpoonAssistMark';

// The one placeholder every photo-less recipe uses -- card, carousel, and
// detail hero alike -- so a missing photo never falls back to a generic
// fork/knife icon (that glyph is reserved for the bottom nav's Recipes tab).
// Meant to sit inside a `.sa-plate` circle, which already supplies the
// dark --sa-green-deep disc background.
export default function RecipePlaceholder({ className = '' }) {
  return (
    <div className={`sa-plate-fallback ${className}`}>
      <SpoonAssistMark size="40%" className="text-[var(--sa-green)] opacity-60" />
    </div>
  );
}
