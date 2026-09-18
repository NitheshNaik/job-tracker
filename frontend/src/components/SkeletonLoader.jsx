/**
 * Sleek Tailwind CSS Skeleton Loaders matching Material 3 theme
 */

export function SkeletonStat() {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-[#eceae5] card-elevation-1 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-20 rounded-md bg-surface-container" />
        <div className="h-6 w-6 rounded-full bg-surface-container" />
      </div>
      <div className="h-8 w-14 rounded-md bg-surface-container" />
      <div className="h-4 w-24 rounded-full bg-surface-container" />
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="bg-surface-container-lowest p-4 rounded-2xl border border-[#eceae5] card-elevation-1 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-3 w-24 rounded-md bg-surface-container" />
        <div className="h-4 w-20 rounded-full bg-surface-container" />
      </div>
      <div className="h-7 w-16 rounded-md bg-surface-container" />
      <div className="h-2 w-full rounded-full bg-surface-container" />
    </div>
  );
}

export function SkeletonFollowUp() {
  return (
    <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-[#eceae5] card-elevation-1 animate-pulse flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-surface-container shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-3.5 w-28 rounded-md bg-surface-container" />
        <div className="h-2.5 w-20 rounded-md bg-surface-container" />
      </div>
      <div className="w-16 h-7 rounded-full bg-surface-container shrink-0" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 animate-pulse card-elevation-1 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-surface-container shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="h-4 w-32 rounded-md bg-surface-container" />
            <div className="h-3 w-24 rounded-md bg-surface-container" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-surface-container shrink-0" />
      </div>

      <div className="pt-2 border-t border-surface-container-low flex items-center justify-between">
        <div className="h-3 w-36 rounded-md bg-surface-container" />
        <div className="h-4 w-12 rounded-md bg-surface-container" />
      </div>
    </div>
  );
}
