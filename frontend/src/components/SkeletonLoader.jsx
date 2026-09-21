/**
 * iOS-style Skeleton Loaders — white card base with #F2F2F7 shimmer blocks
 */

const shimmerClass = 'animate-pulse rounded-[10px]';
const shimmerStyle = { background: 'rgba(120,120,128,0.12)' };
const cardStyle = {
  background: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
};

export function SkeletonStat() {
  return (
    <div className="p-4 space-y-3 animate-pulse" style={cardStyle}>
      <div className="flex justify-between items-center">
        <div className={`h-3 w-20 ${shimmerClass}`} style={shimmerStyle} />
        <div className="w-6 h-6 rounded-full animate-pulse" style={shimmerStyle} />
      </div>
      <div className={`h-9 w-14 ${shimmerClass}`} style={shimmerStyle} />
      <div className={`h-4 w-24 rounded-full ${shimmerClass}`} style={shimmerStyle} />
    </div>
  );
}

export function SkeletonBanner() {
  return (
    <div className="p-4 space-y-3 animate-pulse" style={cardStyle}>
      <div className="flex justify-between items-center">
        <div className={`h-3 w-24 ${shimmerClass}`} style={shimmerStyle} />
        <div className={`h-4 w-20 rounded-full ${shimmerClass}`} style={shimmerStyle} />
      </div>
      <div className={`h-8 w-16 ${shimmerClass}`} style={shimmerStyle} />
      <div className="h-1.5 w-full rounded-full animate-pulse" style={shimmerStyle} />
    </div>
  );
}

export function SkeletonFollowUp() {
  return (
    <div className="p-3.5 animate-pulse flex items-center gap-3" style={cardStyle}>
      <div className="w-10 h-10 rounded-[12px] shrink-0 animate-pulse" style={shimmerStyle} />
      <div className="flex-1 min-w-0 space-y-2">
        <div className={`h-3.5 w-28 ${shimmerClass}`} style={shimmerStyle} />
        <div className={`h-2.5 w-20 ${shimmerClass}`} style={shimmerStyle} />
      </div>
      <div className="w-20 h-7 rounded-full shrink-0 animate-pulse" style={shimmerStyle} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 animate-pulse space-y-3" style={cardStyle}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-[12px] shrink-0 animate-pulse" style={shimmerStyle} />
          <div className="space-y-2 flex-1 min-w-0">
            <div className={`h-4 w-32 ${shimmerClass}`} style={shimmerStyle} />
            <div className={`h-3 w-24 ${shimmerClass}`} style={shimmerStyle} />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full animate-pulse shrink-0" style={shimmerStyle} />
      </div>
      <div className="pt-2.5 flex items-center justify-between" style={{ borderTop: '0.5px solid rgba(60,60,67,0.10)' }}>
        <div className={`h-3 w-36 ${shimmerClass}`} style={shimmerStyle} />
        <div className={`h-3.5 w-12 ${shimmerClass}`} style={shimmerStyle} />
      </div>
    </div>
  );
}
