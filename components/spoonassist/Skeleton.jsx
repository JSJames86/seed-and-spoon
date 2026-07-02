// Generic pulsing placeholder block, plus a couple of shapes composed from
// it that match the components they stand in for while data loads.

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-[var(--sa-radius-card)] bg-[var(--sa-surface-alt)] ${className}`} />;
}

export function RecipeCardSkeleton({ className = '' }) {
  return (
    <div className={`rounded-[var(--sa-radius-card)] bg-[var(--sa-surface)] p-4 shadow-[var(--sa-shadow-card)] ${className}`}>
      <Skeleton className="mx-auto mb-3 h-28 w-28 !rounded-full" />
      <Skeleton className="mx-auto h-4 w-3/4" />
      <div className="mt-2 flex justify-center gap-1.5">
        <Skeleton className="h-6 w-16 !rounded-[var(--sa-radius-pill)]" />
        <Skeleton className="h-6 w-12 !rounded-[var(--sa-radius-pill)]" />
      </div>
    </div>
  );
}

export function RecipeGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListRowSkeleton({ className = '' }) {
  return <Skeleton className={`h-[52px] ${className}`} />;
}
