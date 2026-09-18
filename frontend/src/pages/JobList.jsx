import { useState, useEffect, useCallback } from 'react';
import api from '../api/jobApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES = ['All', 'Applied', 'Assessment', 'Interviewing', 'Rejected', 'Offer', 'Ghosted'];
const SOURCES  = ['All', 'LinkedIn', 'Wellfound', 'Company Website', 'Referral', 'Cold Email', 'Other'];

const STATUS_STYLES = {
  Applied:      'bg-slate-700/60 text-slate-300',
  Assessment:   'bg-amber-900/50 text-amber-300',
  Interviewing: 'bg-yellow-900/50 text-yellow-300',
  Rejected:     'bg-red-900/50   text-red-400',
  Offer:        'bg-emerald-900/50 text-emerald-300',
  Ghosted:      'bg-zinc-800/70  text-zinc-400',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysBetween(date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

function groupJobs(jobs) {
  const groups = { 'Last 7 Days': [], 'This Month': [], Older: [] };
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const job of jobs) {
    const days = daysBetween(job.dateApplied);
    if (days <= 7) {
      groups['Last 7 Days'].push(job);
    } else if (new Date(job.dateApplied) >= monthStart) {
      groups['This Month'].push(job);
    } else {
      groups['Older'].push(job);
    }
  }
  return groups;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterChips({ label, options, selected, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="px-4 text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">
        {label}
      </span>
      <div className="flex gap-2 overflow-x-auto px-4 pb-0.5 scrollbar-none">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt === 'All' ? '' : opt)}
            className={[
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all duration-150',
              (opt === 'All' ? selected === '' : selected === opt)
                ? 'bg-[var(--color-brand-500)] text-white shadow-md'
                : 'bg-[var(--color-surface-3)] text-[var(--color-muted)] hover:text-[var(--color-text)]',
            ].join(' ')}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status] ?? ''}`}>
      {status}
    </span>
  );
}

function StatusPicker({ currentStatus, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl bg-[var(--color-surface-2)] p-5 pb-8"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Update Status</h3>
          <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUSES.filter((s) => s !== 'All').map((s) => (
            <button
              key={s}
              onClick={() => onSelect(s)}
              className={[
                'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150',
                s === currentStatus
                  ? 'ring-2 ring-[var(--color-brand-400)] ring-offset-1 ring-offset-[var(--color-surface-2)]'
                  : '',
                STATUS_STYLES[s] ?? 'bg-[var(--color-surface-3)] text-[var(--color-muted)]',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, onStatusUpdate }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleStatusSelect(newStatus) {
    if (newStatus === job.status) { setPickerOpen(false); return; }
    setUpdating(true);
    setPickerOpen(false);
    try {
      const { data } = await api.put(`/jobs/${job._id}`, { status: newStatus });
      onStatusUpdate(job._id, data.data);
    } catch {
      /* silent — parent still holds the old data */
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 transition-opacity duration-200 ${updating ? 'opacity-50' : ''}`}>
        {/* Top row: company + status badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">{job.companyName}</p>
            <p className="truncate text-xs text-[var(--color-muted)]">{job.jobTitle}</p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        {/* Meta row: source + date */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-[11px] text-[var(--color-muted)]">
            {/* source icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-3.5 shrink-0">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.source}
          </span>
          <span className="text-[11px] text-[var(--color-muted)]">
            {formatDate(job.dateApplied)}
          </span>
        </div>

        {/* Update status action */}
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setPickerOpen(true)}
            disabled={updating}
            className="flex items-center gap-1 rounded-lg bg-[var(--color-surface-3)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)] disabled:cursor-not-allowed"
          >
            {updating ? (
              <>
                <svg className="size-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Updating…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-3.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Update status
              </>
            )}
          </button>
        </div>
      </div>

      {pickerOpen && (
        <StatusPicker
          currentStatus={job.status}
          onSelect={handleStatusSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}

function SectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)]">{label}</span>
      <span className="rounded-full bg-[var(--color-surface-3)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
        {count}
      </span>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-2/3 rounded bg-[var(--color-surface-3)]" />
          <div className="h-2.5 w-1/2 rounded bg-[var(--color-surface-3)]" />
        </div>
        <div className="h-5 w-20 rounded-full bg-[var(--color-surface-3)]" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-2.5 w-24 rounded bg-[var(--color-surface-3)]" />
        <div className="h-2.5 w-20 rounded bg-[var(--color-surface-3)]" />
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function JobList() {
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sort,         setSort]         = useState('newest');

  // Fetch jobs whenever filters/sort change
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;
      params.sort = sort;

      const { data } = await api.get('/jobs', { params });
      setJobs(data.data);
    } catch (err) {
      setError(err.response?.data?.error ?? 'Failed to load applications. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, sort]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  // Inline status update — no full refetch needed
  function handleStatusUpdate(id, updatedJob) {
    setJobs((prev) => prev.map((j) => (j._id === id ? updatedJob : j)));
  }

  const grouped = groupJobs(jobs);
  const totalVisible = jobs.length;

  return (
    <div className="flex flex-col gap-0 pb-2">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[var(--color-surface)]/90 pb-3 pt-5 backdrop-blur-md">
        <div className="flex items-baseline justify-between px-4">
          <h1 className="text-xl font-bold text-[var(--color-text)]">Applications</h1>
          {!loading && (
            <span className="text-xs text-[var(--color-muted)]">
              {totalVisible} {totalVisible === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>

        {/* Sort toggle */}
        <div className="mt-3 flex items-center gap-2 px-4">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-muted)]">Sort</span>
          <button
            onClick={() => setSort((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            className="flex items-center gap-1.5 rounded-full bg-[var(--color-surface-3)] px-3 py-1 text-xs font-medium text-[var(--color-text)] transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="size-3.5">
              {sort === 'newest'
                ? <><polyline points="6 9 12 15 18 9" /></>
                : <><polyline points="18 15 12 9 6 15" /></>
              }
            </svg>
            {sort === 'newest' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-col gap-2.5">
          <FilterChips label="Status" options={STATUSES} selected={statusFilter} onChange={setStatusFilter} />
          <FilterChips label="Source" options={SOURCES}  selected={sourceFilter} onChange={setSourceFilter} />
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="px-4 pt-3">
        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && totalVisible === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2}
              className="size-14 text-[var(--color-muted)]">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
            <p className="text-sm font-medium text-[var(--color-muted)]">No applications found</p>
            <p className="text-xs text-[var(--color-muted)]/60">
              {statusFilter || sourceFilter ? 'Try clearing your filters' : 'Add your first application to get started'}
            </p>
          </div>
        )}

        {/* Grouped job cards */}
        {!loading && !error && totalVisible > 0 && (
          <div className="flex flex-col gap-6 pb-4">
            {Object.entries(grouped).map(([section, sectionJobs]) => {
              if (sectionJobs.length === 0) return null;
              return (
                <div key={section} className="flex flex-col gap-3">
                  <SectionHeader label={section} count={sectionJobs.length} />
                  {sectionJobs.map((job) => (
                    <JobCard key={job._id} job={job} onStatusUpdate={handleStatusUpdate} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
