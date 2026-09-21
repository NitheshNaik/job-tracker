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
  if (days <= 7)  return 'Last 7 Days';
  if (days <= 31) return 'This Month';
  return 'Older';
}

// ─── iOS Pill Chip ────────────────────────────────────────────────────────────
function Chip({ label, active, onClick, small }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 transition-all duration-150 active:scale-[0.93] font-semibold select-none ${
        small ? 'px-3 py-1 text-[10px] rounded-full' : 'px-3.5 py-1.5 text-[11px] rounded-full'
      }`}
      style={
        active
          ? { background: '#007AFF', color: '#FFFFFF' }
          : { background: 'rgba(120,120,128,0.12)', color: '#3C3C43' }
      }
    >
      {label}
    </button>
  );
}

export default function JobList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const highlightRef = useRef(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All Sources');
  const [sort, setSort]     = useState('newest');
  const [search, setSearch] = useState('');

  const { jobs, loading, error, refetch, updateJobStatus } = useJobs({
    status: statusFilter,
    source: sourceFilter,
    sort,
  });

  useEffect(() => {
    if (!loading && highlightId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [loading, highlightId]);

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

  const groups = useMemo(() => {
    return SECTION_ORDER.map((label) => ({
      label,
      items: visibleJobs.filter((j) => groupJob(j) === label),
    })).filter((g) => g.items.length > 0);
  }, [visibleJobs]);

  const hasActiveFilters = statusFilter !== 'All' || sourceFilter !== 'All Sources' || search.trim() !== '';

  const clearFilters = () => {
    setStatusFilter('All');
    setSourceFilter('All Sources');
    setSearch('');
  };

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
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[11px] font-bold text-white"
            style={{ background: 'linear-gradient(145deg, #339DFF, #007AFF)' }}
          >
            JT
          </div>
          <span className="text-[17px] font-bold tracking-tight" style={{ color: '#000', letterSpacing: '-0.01em' }}>
            Trckr
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/add')}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90"
          style={{ background: '#007AFF' }}
          title="Add application"
        >
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '18px', fontVariationSettings: "'wght' 600" }}
          >
            add
          </span>
        </button>
      </header>

      {/* ── Main Canvas ──────────────────────────────────────────────────────── */}
      <main className="px-4 pb-6 pt-4 space-y-4 flex-1">

        {/* Title + Count */}
        <section className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h1
              className="text-[32px] font-bold tracking-tight"
              style={{ color: '#000', letterSpacing: '-0.02em' }}
            >
              Applications
            </h1>
            {!loading && (
              <span
                className="text-[13px] font-semibold"
                style={{ color: '#8E8E93' }}
              >
                {visibleJobs.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="flex items-center gap-1 text-[13px] font-semibold transition-opacity active:opacity-50 disabled:opacity-30"
            style={{ color: '#007AFF' }}
          >
            <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`} style={{ fontSize: '16px' }}>
              refresh
            </span>
            Refresh
          </button>
        </section>

        {/* Error */}
        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {/* ── iOS-style Search Bar ──────────────────────────────────────────── */}
        <div className="relative w-full">
          <span
            className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
            style={{ color: '#8E8E93' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company, role, or source…"
            className="w-full h-10 pl-9 pr-8 text-[15px] rounded-[10px] outline-none transition-all duration-150 focus:ring-2"
            style={{
              background: 'rgba(120,120,128,0.12)',
              color: '#000',
              caretColor: '#007AFF',
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-2.5 flex items-center transition-opacity active:opacity-50"
              style={{ color: '#8E8E93' }}
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(60,60,67,0.3)' }}
              >
                <span className="material-symbols-outlined text-white" style={{ fontSize: '11px' }}>close</span>
              </span>
            </button>
          )}
        </div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="space-y-2.5">
          {/* Status chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 -mx-4 px-4 no-scrollbar">
            {STATUSES.map((s) => (
              <Chip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
            ))}
          </div>

          {/* Sources + Sort */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 min-w-0 no-scrollbar">
              {SOURCES.map((s) => (
                <Chip key={s} label={s} active={sourceFilter === s} onClick={() => setSourceFilter(s)} small />
              ))}
            </div>

            {/* Segmented sort control */}
            <div
              className="shrink-0 flex items-center p-0.5 rounded-[8px]"
              style={{ background: 'rgba(120,120,128,0.12)' }}
            >
              {[['newest', 'Newest'], ['oldest', 'Oldest']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSort(val)}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded-[6px] transition-all duration-200 active:scale-95"
                  style={
                    sort === val
                      ? { background: '#FFFFFF', color: '#000', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }
                      : { color: '#8E8E93' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-semibold transition-opacity active:opacity-50"
              style={{ color: '#FF3B30' }}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3 pt-1">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && visibleJobs.length === 0 && (
          <EmptyState isFiltered={hasActiveFilters} onClearFilters={clearFilters} />
        )}

        {/* ── Job Groups ─────────────────────────────────────────────────────── */}
        {!loading && !error && groups.length > 0 && (
          <div className="space-y-5 pt-1">
            {groups.map(({ label, items }) => (
              <section key={label} className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h2
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: '#8E8E93' }}
                  >
                    {label}
                  </h2>
                  <span className="text-[10px] font-medium" style={{ color: '#C7C7CC' }}>
                    {items.length} {items.length === 1 ? 'app' : 'apps'}
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
