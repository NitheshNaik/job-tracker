import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import JobCard from '../components/JobCard';
import { SkeletonCard } from '../components/SkeletonLoader';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';

// ─── Filter Constants ─────────────────────────────────────────────────────────
const STATUSES = ['All', 'Applied', 'Assessment', 'Interviewing', 'Offer', 'Ghosted', 'Rejected'];
const SOURCES  = ['All Sources', 'LinkedIn', 'Wellfound', 'Company Website', 'Referral', 'Cold Email', 'Other'];

// ─── Date Grouping Helper ─────────────────────────────────────────────────────
const SECTION_ORDER = ['Last 7 Days', 'This Month', 'Older'];

function groupJob(job) {
  if (!job.dateApplied) return 'Older';
  const ms = Date.now() - new Date(job.dateApplied).getTime();
  const days = Math.floor(ms / 86_400_000);
  if (days <= 7) return 'Last 7 Days';
  if (days <= 31) return 'This Month';
  return 'Older';
}

export default function JobList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightRef = useRef(null);

  // Filter and Sort states
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [sort, setSort] = useState('newest');
  const [search, setSearch] = useState('');

  // Fetch real MongoDB data using our useJobs hook
  const {
    jobs,
    loading,
    error,
    refetch,
    updateJobStatus,
  } = useJobs({
    status: statusFilter,
    source: sourceFilter,
    sort,
  });

  // Scroll to highlighted card if navigated from Dashboard follow-up
  useEffect(() => {
    if (!loading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, highlightId]);

  // Client-side instant keyword search (company name or job title)
  const visibleJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) => {
      const c = (j.companyName || '').toLowerCase();
      const t = (j.jobTitle || '').toLowerCase();
      const s = (j.source || '').toLowerCase();
      return c.includes(q) || t.includes(q) || s.includes(q);
    });
  }, [jobs, search]);

  // Group into chronological sections
  const groups = useMemo(() => {
    return SECTION_ORDER.map((label) => ({
      label,
      items: visibleJobs.filter((j) => groupJob(j) === label),
    })).filter((g) => g.items.length > 0);
  }, [visibleJobs]);

  const hasActiveFilters =
    statusFilter !== 'All' || sourceFilter !== 'All Sources' || search.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('All');
    setSourceFilter('All Sources');
    setSearch('');
  };

  return (
    <div className="flex flex-col min-h-full pb-20">
      {/* ── Top Bar ─────────────────────────────────────────────────────────────── */}
      <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-surface-container-lowest flex items-center justify-center text-[12px] font-bold">
            JT
          </div>
          <span className="text-[17px] font-bold text-on-surface tracking-tight">Trckr</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/add')}
          className="w-8 h-8 rounded-full bg-primary-container text-surface-container-lowest flex items-center justify-center shadow-xs active:scale-95 transition-transform"
          title="Add application"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
        </button>
      </header>

      {/* ── Main Canvas ─────────────────────────────────────────────────────────── */}
      <main className="px-4 pb-6 pt-3 space-y-3.5 flex-1">
        {/* Title and Count */}
        <section className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-extrabold text-on-surface tracking-tight">
              Applications
            </h1>
            {!loading && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary text-[11px] font-bold">
                {visibleJobs.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="text-[12px] font-semibold text-secondary hover:text-primary flex items-center gap-1 active:scale-95 disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
            <span>Refresh</span>
          </button>
        </section>

        {/* Error Alert */}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* Search Field */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-secondary">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, job role, or source…"
            className="w-full h-11 pl-10 pr-9 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-[13px] text-on-surface placeholder:text-outline focus:border-primary-container focus:outline-none transition-colors shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-3 flex items-center text-secondary hover:text-primary"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* ── Filters ───────────────────────────────────────────────────────────── */}
        <div className="space-y-2 pt-0.5">
          {/* Status horizontal chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 -mx-4 px-4 no-scrollbar">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all active:scale-95 ${
                  statusFilter === s
                    ? 'bg-primary-container text-surface-container-lowest shadow-xs'
                    : 'bg-surface-container-lowest border border-outline-variant/50 text-secondary hover:border-secondary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sources and Sort controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 min-w-0 no-scrollbar">
              {SOURCES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSourceFilter(s)}
                  className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    sourceFilter === s
                      ? 'bg-secondary-container text-on-secondary-container shadow-xs'
                      : 'bg-surface-container-lowest border border-outline-variant/40 text-secondary hover:text-on-surface'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="shrink-0 flex items-center bg-surface-container p-0.5 rounded-lg border border-outline-variant/30">
              {[
                ['newest', 'Newest'],
                ['oldest', 'Oldest'],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSort(val)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-[6px] transition-all ${
                    sort === val
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Loading Skeleton State ────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-3 pt-1">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* ── Empty State ──────────────────────────────────────────────────────── */}
        {!loading && !error && visibleJobs.length === 0 && (
          <EmptyState
            isFiltered={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        )}

        {/* ── Grouped Job Cards List ───────────────────────────────────────────── */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-5 pt-1">
            {groups.map(({ label, items }) => (
              <section key={label} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-[11px] tracking-wider text-secondary uppercase font-extrabold">
                    {label}
                  </h2>
                  <span className="text-[10px] text-secondary font-semibold">
                    {items.length} {items.length === 1 ? 'application' : 'applications'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map((job) => {
                    const isHighlighted = job._id === highlightId;
                    return (
                      <JobCard
                        key={job._id}
                        job={job}
                        onStatusUpdate={updateJobStatus}
                        highlighted={isHighlighted}
                        cardRef={isHighlighted ? highlightRef : null}
                      />
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
