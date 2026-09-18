import { useState } from 'react';

// ─── Status badge color mapping ───────────────────────────────────────────────
export const STATUS_BADGE = {
  Applied:      { bg: '#F4F4F5', text: '#52525B', border: '#E4E4E7' },
  Assessment:   { bg: '#FEF3EB', text: '#8C531B', border: '#F8D8BE' },
  Interviewing: { bg: '#EBF3FE', text: '#1D4ED8', border: '#BFDBFE' },
  Rejected:     { bg: '#FBEAE9', text: '#8C3933', border: '#F5C6C3' },
  Offer:        { bg: '#E6EFE9', text: '#2C5E3B', border: '#C2DEC9' },
  Ghosted:      { bg: '#F4F4F5', text: '#71717A', border: '#E4E4E7' },
};

// ─── Deterministic Avatar palette based on Company Name ───────────────────────
const PALETTE = [
  { bg: '#635BFF14', text: '#635BFF', border: '#635BFF33' },
  { bg: '#0D948814', text: '#0D9488', border: '#0D948833' },
  { bg: '#E03B5214', text: '#E03B52', border: '#E03B5233' },
  { bg: '#10B98114', text: '#059669', border: '#10B98133' },
  { bg: '#D9770614', text: '#B45309', border: '#D9770633' },
  { bg: '#3B82F614', text: '#2563EB', border: '#3B82F633' },
  { bg: '#8B5CF614', text: '#7C3AED', border: '#8B5CF633' },
];

function getAvatarStyle(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function formatDate(dateStr) {
  if (!dateStr) return 'Recently';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Inline Status Picker Modal / Sheet ───────────────────────────────────────
function StatusPickerModal({ currentStatus, onSelect, onClose }) {
  const statuses = ['Applied', 'Assessment', 'Interviewing', 'Offer', 'Ghosted', 'Rejected'];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[375px] mx-auto bg-surface rounded-t-3xl border-t border-outline-variant/30 shadow-2xl p-5 pb-8 space-y-3 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-outline-variant rounded-full mx-auto mb-2" />
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-on-surface">Change Application Status</p>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-secondary hover:text-primary"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {statuses.map((s) => {
            const badge = STATUS_BADGE[s] || { bg: '#F4F4F5', text: '#52525B' };
            const isActive = s === currentStatus;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSelect(s)}
                className={`py-2 px-3 rounded-xl text-[12px] font-bold text-left flex items-center justify-between transition-all active:scale-95 border ${
                  isActive
                    ? 'ring-2 ring-primary-container border-primary-container shadow-xs'
                    : 'border-outline-variant/30 hover:opacity-90'
                }`}
                style={{ backgroundColor: badge.bg, color: badge.text }}
              >
                <span>{s}</span>
                {isActive && (
                  <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Robust JobCard Component with resilient handling of optional/null fields
 * and responsive text truncation.
 */
export default function JobCard({ job, onStatusUpdate, highlighted, cardRef }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const company = job?.companyName?.trim() || 'Unknown Company';
  const title = job?.jobTitle?.trim() || 'Untitled Role';
  const status = job?.status || 'Applied';
  const source = job?.source || 'Other';
  const notes = job?.notes?.trim() || null;
  const referral = job?.referralContact?.trim() || null;
  const jobLink = job?.jobLink?.trim() || null;
  const resume = job?.resumeUsed?.trim() || null;

  const av = getAvatarStyle(company);
  const badge = STATUS_BADGE[status] || STATUS_BADGE.Applied;

  async function handleStatusSelect(newStatus) {
    setPickerOpen(false);
    if (newStatus === status) return;
    setUpdating(true);
    try {
      await onStatusUpdate(job._id, newStatus);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <>
      <article
        ref={cardRef}
        className={`bg-surface-container-lowest rounded-2xl p-4 transition-all duration-200 border card-elevation-1 space-y-2.5 ${
          updating ? 'opacity-50 pointer-events-none' : ''
        } ${
          highlighted
            ? 'border-primary-container ring-2 ring-primary-container/30 bg-primary-container/[0.02]'
            : 'border-outline-variant/40 hover:border-outline-variant'
        }`}
      >
        {/* Top row: Avatar + Company/Title + Status Badge */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Deterministic initial avatar */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[15px] shrink-0 uppercase shadow-xs"
              style={{
                backgroundColor: av.bg,
                color: av.text,
                border: `1px solid ${av.border}`,
              }}
            >
              {company[0]}
            </div>

            {/* Truncated text with line-clamp/truncate prevents UI breaks */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <h3 className="text-[15px] font-bold text-on-surface leading-tight truncate">
                  {company}
                </h3>
                {jobLink && (
                  <a
                    href={jobLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-secondary hover:text-primary shrink-0 inline-flex items-center"
                    title="Open job link"
                  >
                    <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                  </a>
                )}
              </div>
              <p className="text-[13px] font-medium text-secondary leading-tight truncate mt-0.5">
                {title}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            title="Click to change status"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-tight shrink-0 transition-transform active:scale-95 border"
            style={{
              backgroundColor: badge.bg,
              color: badge.text,
              borderColor: badge.border,
            }}
          >
            <span>{status}</span>
            <span className="material-symbols-outlined text-[13px]">expand_more</span>
          </button>
        </div>

        {/* Optional Data Variations: Referral & Resume tags */}
        {(referral || resume) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {referral && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant text-[10px] font-semibold truncate max-w-[180px]">
                <span className="material-symbols-outlined text-[12px] shrink-0">person</span>
                <span className="truncate">Ref: {referral}</span>
              </span>
            )}
            {resume && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary-container/50 text-on-secondary-container text-[10px] font-semibold truncate max-w-[140px]">
                <span className="material-symbols-outlined text-[12px] shrink-0">description</span>
                <span className="truncate">{resume}</span>
              </span>
            )}
          </div>
        )}

        {/* Optional Field: Notes (truncates by default, can be toggled) */}
        {notes && (
          <div
            onClick={() => setExpanded(!expanded)}
            className="text-[12px] text-secondary/90 bg-surface-container/50 rounded-xl px-2.5 py-1.5 cursor-pointer hover:bg-surface-container transition-colors"
          >
            <p className={expanded ? 'break-words' : 'line-clamp-1'}>
              <span className="font-semibold text-secondary">Note: </span>
              {notes}
            </p>
          </div>
        )}

        {/* Bottom footer: Source & DateApplied */}
        <div className="pt-2 border-t border-[#eceae5] flex items-center justify-between text-[11px] text-secondary">
          <span className="flex items-center gap-1.5 min-w-0">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: badge.text }}
            />
            <span className="truncate">{source}</span>
            <span>•</span>
            <span className="shrink-0">{formatDate(job.dateApplied)}</span>
          </span>

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            disabled={updating}
            className="flex items-center gap-0.5 font-bold text-primary-container hover:opacity-80 transition-opacity active:scale-95 shrink-0 ml-2"
          >
            {updating ? (
              <span className="material-symbols-outlined text-[14px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[14px]">edit_note</span>
            )}
            <span>{updating ? 'Updating…' : 'Update'}</span>
          </button>
        </div>
      </article>

      {/* Status Picker Bottom Sheet */}
      {pickerOpen && (
        <StatusPickerModal
          currentStatus={status}
          onSelect={handleStatusSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </>
  );
}
