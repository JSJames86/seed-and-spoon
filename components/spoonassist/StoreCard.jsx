import { getRetailerLink } from '@/data/retailerLinks';

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShopAtLink({ storeId, storeName, onShopAtClick }) {
  const { label, url } = getRetailerLink({ id: storeId, name: storeName });
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => onShopAtClick?.({ chainId: storeId, url })}
      className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--sa-green-deep)] underline decoration-[var(--sa-green)] underline-offset-2 hover:opacity-80"
    >
      Shop at {label} &#8599;
    </a>
  );
}

// One store's basket total in the compare grid. `isBest` renders the green
// "Best total" ribbon. Instacart's CTA does not live on this screen (spec:
// the Instacart CTA and multi-retailer totals must never share a screen) --
// the "Shop at [Retailer]" link below is a plain outbound link, no partner
// approval required.
export default function StoreCard({
  name,
  storeId,
  total,
  deltaFromMostExpensive,
  availableCount,
  itemCount,
  isBest = false,
  onShopAtClick,
  className = '',
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)] ${className}`}
    >
      {isBest && (
        <span className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-[var(--sa-radius-card)] bg-[var(--sa-savings)] px-3 py-1 text-[11px] font-semibold text-white">
          <CheckIcon /> Best total
        </span>
      )}

      <p className="text-[15px] font-semibold text-[var(--sa-ink)]">{name}</p>
      <p className="mt-1 text-[28px] font-semibold text-[var(--sa-ink)]">${total.toFixed(2)}</p>

      {!isBest && deltaFromMostExpensive != null && deltaFromMostExpensive > 0 && (
        <p className="mt-0.5 text-[13px] font-medium text-[var(--sa-savings)]">
          Save ${deltaFromMostExpensive.toFixed(2)} vs. priciest
        </p>
      )}

      {itemCount != null && (
        <p className="mt-2 text-[13px] text-[var(--sa-ink-soft)]">
          {availableCount} of {itemCount} items priced
        </p>
      )}

      {storeId && <ShopAtLink storeId={storeId} storeName={name} onShopAtClick={onShopAtClick} />}
    </div>
  );
}
