import { useNavigate } from 'react-router-dom';
import { useJobStats } from '../hooks/useJobs';
import { SkeletonStat, SkeletonBanner, SkeletonFollowUp } from '../components/SkeletonLoader';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(99,91,255,0.12)',  text: '#635BFF' },
  { bg: 'rgba(13,148,136,0.12)', text: '#0D9488' },
  { bg: 'rgba(224,59,82,0.12)',  text: '#E03B52' },
  { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  { bg: 'rgba(217,119,6,0.12)',  text: '#B45309' },
  { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
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

// ─── Reusable iOS Section Header ─────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-wider px-1" style={{ color: '#8E8E93' }}>
      {children}
    </h2>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconName, iconBg, iconColor, badge }) {
  return (
    <div className="ios-card p-4 flex flex-col justify-between gap-3 transition-all duration-300 active:scale-[0.98]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold" style={{ color: '#8E8E93' }}>{label}</span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: iconBg }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px', color: iconColor }}>
            {iconName}
          </span>
        </div>
      </div>
      <div>
        <div className="text-[34px] font-bold tracking-tight leading-none mb-1.5" style={{ color: '#000', letterSpacing: '-0.02em' }}>
          {value}
        </div>
        {badge ? badge : (
          <span className="text-[11px] font-medium" style={{ color: '#8E8E93' }}>{sub}</span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useJobStats();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  // Derived metrics
  const total       = stats?.totalApplied ?? 0;
  const statusCounts = stats?.statusCounts || {};
  const responses   = (statusCounts.Interviewing ?? 0) + (statusCounts.Offer ?? 0) + (statusCounts.Rejected ?? 0);
  const rejRate     = stats?.rejectionRate ?? 0;
  const thisMonth   = stats?.appliedThisMonth ?? 0;
  const lastMonth   = stats?.appliedLastMonth ?? 0;
  const monthDiff   = thisMonth - lastMonth;
  const monthPct    = thisMonth + lastMonth > 0
    ? Math.round((thisMonth / (thisMonth + lastMonth)) * 100)
    : 50;
  const followUps   = stats?.needingFollowUp || [];

  return (
    <div className="flex flex-col min-h-full pb-20">

      {/* ── iOS Navigation Bar ─────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 pt-12 pb-3"
        style={{
          background: 'rgba(242,242,247,0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderBottom: '0.5px solid rgba(60,60,67,0.18)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white tracking-tight"
            style={{ background: 'linear-gradient(145deg, #339DFF, #007AFF)', boxShadow: '0 2px 8px rgba(0,122,255,0.35)' }}
          >
            JT
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-bold tracking-tight" style={{ color: '#000', letterSpacing: '-0.01em' }}>
              Trckr
            </span>
            <span className="text-[10px] font-medium" style={{ color: '#8E8E93' }}>
              Live MongoDB Data
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={refetch}
          title="Refresh stats"
          disabled={loading}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-40"
          style={{ background: 'rgba(120,120,128,0.12)' }}
        >
          <span
            className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}
            style={{ fontSize: '18px', color: '#007AFF', fontVariationSettings: "'wght' 500" }}
          >
            refresh
          </span>
        </button>
      </header>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <main className="px-4 pt-5 space-y-5 flex-1">

        {/* Greeting + Date */}
        <section>
          <p className="text-[13px] font-semibold mb-0.5" style={{ color: '#8E8E93' }}>{today}</p>
          <div className="flex items-center justify-between">
            <h1
              className="text-[32px] font-bold tracking-tight"
              style={{ color: '#000', letterSpacing: '-0.02em', lineHeight: 1.08 }}
            >
              Dashboard
            </h1>
            {!loading && !error && total > 0 && (
              <span
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,122,255,0.10)', color: '#007AFF' }}
              >
                {total} Tracked
              </span>
            )}
          </div>
          <p className="text-[14px] mt-1" style={{ color: '#8E8E93' }}>Your live job search progress</p>
        </section>

        {/* Error State */}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <section className="space-y-3">
          <SectionLabel>Overview</SectionLabel>

          {loading ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <SkeletonStat /><SkeletonStat />
              </div>
              <SkeletonBanner />
            </>
          ) : !error && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Applied"
                  value={total}
                  iconName="send"
                  iconBg="rgba(0,122,255,0.12)"
                  iconColor="#007AFF"
                  badge={
                    thisMonth > 0
                      ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(52,199,89,0.12)', color: '#34C759' }}>
                          +{thisMonth} this month
                        </span>
                      : <span className="text-[11px] font-medium" style={{ color: '#8E8E93' }}>0 this month</span>
                  }
                />
                <StatCard
                  label="Responses"
                  value={responses}
                  iconName="forum"
                  iconBg="rgba(255,149,0,0.12)"
                  iconColor="#FF9500"
                  sub={responses > 0 ? `${stats?.responseRate ?? 0}% response rate` : 'Awaiting responses'}
                />
              </div>

              {/* Rejection Rate Card */}
              <div className="ios-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold" style={{ color: '#8E8E93' }}>Rejection Rate</span>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(120,120,128,0.10)', color: '#8E8E93' }}
                  >
                    Benchmark: 22%
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-[30px] font-bold tracking-tight" style={{ color: '#000', letterSpacing: '-0.02em' }}>
                    {rejRate}%
                  </span>
                  {total > 0 && rejRate <= 22 && (
                    <span className="text-[11px] font-semibold flex items-center gap-0.5" style={{ color: '#34C759' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>trending_down</span>
                      {(22 - rejRate).toFixed(1)}% below benchmark
                    </span>
                  )}
                  {total > 0 && rejRate > 22 && (
                    <span className="text-[11px] font-semibold flex items-center gap-0.5" style={{ color: '#FF3B30' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>trending_up</span>
                      {(rejRate - 22).toFixed(1)}% above
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(120,120,128,0.12)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${monthPct}%`,
                        background: 'linear-gradient(90deg, #007AFF, #5AC8FA)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px]" style={{ color: '#8E8E93' }}>
                      {thisMonth} this month
                      {lastMonth > 0 && (
                        <span style={{ color: monthDiff >= 0 ? '#34C759' : '#8E8E93', fontWeight: 600 }}>
                          {' '}({monthDiff >= 0 ? `+${monthDiff}` : monthDiff} vs last)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Follow-up Section ─────────────────────────────────────────────── */}
        <section className="space-y-3 pt-1 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SectionLabel>Needing Follow-up</SectionLabel>
              {!loading && followUps.length > 0 && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full text-white"
                  style={{ background: '#FF9500' }}
                >
                  {followUps.length}
                </span>
              )}
            </div>
            {!loading && total > 0 && (
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="text-[13px] font-semibold transition-opacity active:opacity-50"
                style={{ color: '#007AFF' }}
              >
                View all
              </button>
            )}
          </div>

          {/* Skeletons */}
          {loading && (
            <div className="space-y-2">
              <SkeletonFollowUp /><SkeletonFollowUp />
            </div>
          )}

          {/* All caught up */}
          {!loading && !error && followUps.length === 0 && total > 0 && (
            <div className="ios-card p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                style={{ background: 'rgba(52,199,89,0.12)' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: '20px', color: '#34C759', fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-semibold" style={{ color: '#000' }}>All caught up!</p>
                <p className="text-[12px] mt-0.5" style={{ color: '#8E8E93' }}>
                  No applications waiting over 14 days without response.
                </p>
              </div>
            </div>
          )}

          {/* Follow-up rows */}
          {!loading && !error && followUps.length > 0 && (
            <div className="space-y-2">
              {followUps.map((job) => {
                const av = getAvatarStyle(job.companyName);
                const days = daysAgo(job.dateApplied);
                return (
                  <article
                    key={job._id}
                    onClick={() => navigate(`/jobs?highlight=${job._id}`)}
                    className="ios-card p-3.5 flex items-center justify-between transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-10 h-10 rounded-[12px] font-bold flex items-center justify-center shrink-0 text-[15px]"
                        style={{ background: av.bg, color: av.text }}
                      >
                        {(job.companyName?.[0] ?? '?').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1 pr-2">
                        <h3 className="text-[14px] font-semibold leading-tight truncate" style={{ color: '#000' }}>
                          {job.companyName}
                        </h3>
                        <p className="text-[12px] leading-tight truncate mt-0.5" style={{ color: '#8E8E93' }}>
                          {job.jobTitle}
                        </p>
                        <span className="inline-block text-[10px] mt-1 font-medium" style={{ color: '#C7C7CC' }}>
                          Applied {days}d ago
                        </span>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1.5 rounded-full text-white text-[11px] font-semibold tracking-tight shrink-0 flex items-center gap-1"
                      style={{ background: '#007AFF' }}
                    >
                      Follow-up
                      <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_forward</span>
                    </span>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Zero-Data Empty State */}
        {!loading && !error && total === 0 && <EmptyState isFiltered={false} />}
      </main>
    </div>
  );
}
