import { useNavigate } from 'react-router-dom';
import { useJobStats } from '../hooks/useJobs';
import { SkeletonStat, SkeletonBanner, SkeletonFollowUp } from '../components/SkeletonLoader';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: '#635BFF14', text: '#635BFF', border: '#635BFF33' },
  { bg: '#0D948814', text: '#0D9488', border: '#0D948833' },
  { bg: '#E03B5214', text: '#E03B52', border: '#E03B5233' },
  { bg: '#10B98114', text: '#059669', border: '#10B98133' },
  { bg: '#D9770614', text: '#B45309', border: '#D9770633' },
  { bg: '#3B82F614', text: '#2563EB', border: '#3B82F633' },
];

function getAvatarStyle(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function daysAgo(dateStr) {
  if (!dateStr) return 0;
  const ms = Date.now() - new Date(dateStr).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useJobStats();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Derived metrics from real MongoDB aggregated stats
  const total = stats?.totalApplied ?? 0;
  const statusCounts = stats?.statusCounts || {};
  const responses =
    (statusCounts.Interviewing ?? 0) +
    (statusCounts.Offer ?? 0) +
    (statusCounts.Rejected ?? 0);
  const rejRate = stats?.rejectionRate ?? 0;
  const thisMonth = stats?.appliedThisMonth ?? 0;
  const lastMonth = stats?.appliedLastMonth ?? 0;
  const monthDiff = thisMonth - lastMonth;
  const monthPct =
    thisMonth + lastMonth > 0
      ? Math.round((thisMonth / (thisMonth + lastMonth)) * 100)
      : 50;
  const followUps = stats?.needingFollowUp || [];

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* ── Top App Bar ─────────────────────────────────────────────────────────── */}
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-outline-variant/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-container text-surface-container-lowest flex items-center justify-center text-[12px] font-bold tracking-tight shadow-sm">
            JT
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold tracking-tight text-on-surface leading-none">
              Trckr
            </span>
            <span className="text-[10px] text-secondary tracking-wide mt-0.5">
              Live MongoDB Data
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={refetch}
          title="Refresh stats"
          disabled={loading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-primary transition-colors active:scale-95 disabled:opacity-50"
        >
          <span
            className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}
          >
            refresh
          </span>
        </button>
      </header>

      {/* ── Content ─────────────────────────────────────────────────────────────── */}
      <main className="px-4 pt-4 space-y-4 flex-1">
        {/* Date & Greeting */}
        <section className="pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-secondary font-bold tracking-wide uppercase">
              {today}
            </span>
            {!loading && !error && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold tracking-tight">
                {total > 0 ? `${total} Total Tracked` : 'Ready to Start'}
              </span>
            )}
          </div>
          <h1 className="text-[26px] leading-tight text-primary font-extrabold tracking-tight mt-1">
            Dashboard
          </h1>
          <p className="text-[13px] text-secondary mt-0.5">Your live job search progress</p>
        </section>

        {/* Error State */}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* ── Stat Cards (Skeletons while loading) ──────────────────────────────── */}
        <section className="space-y-3">
          {loading ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SkeletonStat />
                <SkeletonStat />
              </div>
              <SkeletonBanner />
            </>
          ) : !error && (
            <>
              <div className="grid grid-cols-2 gap-3">
                {/* Total Applied */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-[#eceae5] card-elevation-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-secondary font-semibold">
                      Total Applied
                    </span>
                    <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
                      <span className="material-symbols-outlined text-[15px]">send</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[32px] font-extrabold text-primary tracking-tight leading-none mb-2">
                      {total}
                    </div>
                    {thisMonth > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#E6EFE9] text-[#2C5E3B] text-[10px] font-bold">
                        +{thisMonth} this month
                      </span>
                    ) : (
                      <span className="text-[11px] text-secondary font-medium">0 this month</span>
                    )}
                  </div>
                </div>

                {/* Responses */}
                <div className="bg-surface-container-lowest p-4 rounded-2xl border border-[#eceae5] card-elevation-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[12px] text-secondary font-semibold">Responses</span>
                    <div className="w-7 h-7 rounded-full bg-[#FEF3EB] flex items-center justify-center text-[#8C531B]">
                      <span className="material-symbols-outlined text-[15px]">forum</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[32px] font-extrabold text-primary tracking-tight leading-none mb-2">
                      {responses}
                    </div>
                    <span className="text-secondary text-[11px] font-medium">
                      {responses > 0 ? `${stats?.responseRate ?? 0}% response rate` : 'Awaiting responses'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rejection Rate & Monthly Comparison */}
              <div className="bg-surface-container-lowest p-4 rounded-2xl border border-[#eceae5] card-elevation-1 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-secondary font-semibold">Rejection Rate</span>
                  <span className="text-secondary bg-surface-container px-2 py-0.5 rounded-full text-[10px] font-medium">
                    Benchmark: 22%
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-bold text-primary tracking-tight">
                    {rejRate}%
                  </span>
                  {total > 0 && rejRate <= 22 && (
                    <span className="text-[11px] text-[#2C5E3B] font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">arrow_downward</span>
                      {(22 - rejRate).toFixed(1)}% vs benchmark
                    </span>
                  )}
                  {total > 0 && rejRate > 22 && (
                    <span className="text-[11px] text-error font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                      {(rejRate - 22).toFixed(1)}% above benchmark
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-[#eceae5] flex items-center justify-between text-[11px]">
                  <span className="text-secondary">
                    {thisMonth} applied this month
                    {lastMonth > 0 && (
                      <span className={monthDiff >= 0 ? ' text-[#2C5E3B] font-semibold' : ' text-secondary'}>
                        {' '}({monthDiff >= 0 ? `+${monthDiff}` : monthDiff} vs last month)
                      </span>
                    )}
                  </span>
                  <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="bg-primary-container h-full rounded-full transition-all duration-300"
                      style={{ width: `${monthPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Needing Follow-up Section ────────────────────────────────────────── */}
        <section className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-[16px] text-primary font-bold tracking-tight">
                Needing Follow-up
              </h2>
              {!loading && followUps.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 text-[11px] font-bold bg-[#FEF3EB] text-[#8C531B] rounded-full">
                  {followUps.length}
                </span>
              )}
            </div>

            {!loading && total > 0 && (
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="text-primary-container font-semibold hover:underline text-[12px]"
              >
                View all jobs
              </button>
            )}
          </div>

          {/* Skeletons */}
          {loading && (
            <div className="space-y-2">
              <SkeletonFollowUp />
              <SkeletonFollowUp />
            </div>
          )}

          {/* Empty follow-ups when collection has jobs */}
          {!loading && !error && followUps.length === 0 && total > 0 && (
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-[#eceae5] card-elevation-1 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E6EFE9] flex items-center justify-center text-[#2C5E3B] shrink-0">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-on-surface leading-tight">All caught up!</p>
                <p className="text-[12px] text-secondary mt-0.5">
                  No applications are waiting over 14 days without response.
                </p>
              </div>
            </div>
          )}

          {/* Real follow-up rows */}
          {!loading && !error && followUps.length > 0 && (
            <div className="space-y-2">
              {followUps.map((job) => {
                const av = getAvatarStyle(job.companyName);
                const days = daysAgo(job.dateApplied);
                return (
                  <article
                    key={job._id}
                    onClick={() => navigate(`/jobs?highlight=${job._id}`)}
                    className="bg-surface-container-lowest p-3.5 rounded-2xl border border-[#eceae5] card-elevation-1 flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer hover:border-outline-variant/60"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm shadow-xs"
                        style={{
                          backgroundColor: av.bg,
                          color: av.text,
                          border: `1px solid ${av.border}`,
                        }}
                      >
                        {(job.companyName?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="text-[14px] font-bold text-primary leading-tight truncate">
                          {job.companyName}
                        </h3>
                        <p className="text-secondary text-[12px] leading-tight truncate mt-0.5">
                          {job.jobTitle}
                        </p>
                        <span className="inline-block text-[10px] text-secondary/80 mt-1 font-medium">
                          Applied {days} days ago
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-primary-container text-surface-container-lowest text-[11px] font-bold tracking-tight shadow-xs shrink-0 flex items-center gap-1">
                      <span>Follow-up</span>
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Zero-Data Empty State (When MongoDB has 0 applications) ───────────── */}
        {!loading && !error && total === 0 && <EmptyState isFiltered={false} />}
      </main>
    </div>
  );
}
