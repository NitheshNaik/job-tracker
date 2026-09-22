import { useState } from 'react';

// ─── Status badge color mapping ───────────────────────────────────────────────
export const STATUS_BADGE = {
  Applied:      { bg: 'rgba(142,142,147,0.12)', text: '#3C3C43',  border: 'transparent' },
  Assessment:   { bg: 'rgba(255,149,0,0.12)',   text: '#FF9500',  border: 'transparent' },
  Interviewing: { bg: 'rgba(0,122,255,0.12)',   text: '#007AFF',  border: 'transparent' },
  Rejected:     { bg: 'rgba(255,59,48,0.12)',   text: '#FF3B30',  border: 'transparent' },
  Offer:        { bg: 'rgba(52,199,89,0.12)',   text: '#34C759',  border: 'transparent' },
  Ghosted:      { bg: 'rgba(142,142,147,0.10)', text: '#8E8E93',  border: 'transparent' },
};

// ─── Deterministic Avatar palette ────────────────────────────────────────────
const PALETTE = [
  { bg: 'rgba(99,91,255,0.12)',  text: '#635BFF' },
  { bg: 'rgba(13,148,136,0.12)', text: '#0D9488' },
  { bg: 'rgba(224,59,82,0.12)',  text: '#E03B52' },
  { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  { bg: 'rgba(217,119,6,0.12)',  text: '#B45309' },
  { bg: 'rgba(59,130,246,0.12)', text: '#2563EB' },
  { bg: 'rgba(139,92,246,0.12)', text: '#7C3AED' },
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

// ─── iOS Action Sheet (Status Picker) ─────────────────────────────────────────
function StatusPickerModal({ currentStatus, onSelect, onClose }) {
  const statuses = ['Applied', 'Assessment', 'Interviewing', 'Offer', 'Ghosted', 'Rejected'];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-4"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[390px] mx-auto rounded-t-[28px] p-5 pb-8 space-y-3 animate-slideUp md:max-w-md md:rounded-[24px] md:p-6 md:pb-6 md:shadow-2xl"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-9 h-1 rounded-full mx-auto mb-1 md:hidden" style={{ background: 'rgba(60,60,67,0.18)' }} />

        <div className="flex items-center justify-between mb-1">
          <p className="text-[16px] font-semibold" style={{ color: '#000' }}>Change Status</p>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-opacity active:opacity-50"
            style={{ background: 'rgba(120,120,128,0.12)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#8E8E93' }}>close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {statuses.map((s) => {
            const badge = STATUS_BADGE[s] || STATUS_BADGE.Applied;
            const isActive = s === currentStatus;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onSelect(s)}
                className="py-3 px-3.5 rounded-[14px] text-[13px] font-semibold text-left flex items-center justify-between transition-all duration-150 active:scale-[0.96]"
                style={{
                  background: badge.bg,
                  color: badge.text,
                  outline: isActive ? `2px solid ${badge.text}` : 'none',
                  outlineOffset: '-1px',
                }}
              >
                <span>{s}</span>
                {isActive && (
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'wght' 600" }}>check</span>
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
 * iOS-style JobCard — white borderless card with Apple multi-layer shadow
 */
export default function JobCard({ job, onStatusUpdate, highlighted, cardRef }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [updating,   setUpdating]   = useState(false);
  const [expanded,   setExpanded]   = useState(false);

  const company = job?.companyName?.trim() || 'Unknown Company';
  const title   = job?.jobTitle?.trim()   || 'Untitled Role';
  const status  = job?.status             || 'Applied';
  const source  = job?.source             || 'Other';
  const notes   = job?.notes?.trim()      || null;
  const referral = job?.referralContact?.trim() || null;
  const jobLink  = job?.jobLink?.trim()   || null;
  const resume   = job?.resumeUsed?.trim() || null;

  const av    = getAvatarStyle(company);
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
        className="transition-all duration-300 active:scale-[0.98]"
        style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: highlighted
            ? '0 0 0 2px #007AFF, 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08)'
            : '0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
          opacity: updating ? 0.55 : 1,
          pointerEvents: updating ? 'none' : 'auto',
        }}
      >
        <div className="p-4 space-y-3">
          {/* Top row */}
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center font-semibold text-[15px] shrink-0 uppercase"
                style={{ background: av.bg, color: av.text }}
              >
                {company[0]}
              </div>

              {/* Company + Title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3
                    className="text-[15px] font-semibold leading-tight truncate"
                    style={{ color: '#000' }}
                  >
                    {company}
                  </h3>
                  {jobLink && (
                    <a
                      href={jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 inline-flex items-center transition-opacity active:opacity-50"
                      style={{ color: '#007AFF' }}
                      title="Open job link"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
                    </a>
                  )}
                </div>
                <p
                  className="text-[13px] leading-tight truncate mt-0.5"
                  style={{ color: '#8E8E93' }}
                >
                  {title}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              title="Tap to change status"
              className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-tight shrink-0 transition-all duration-150 active:scale-[0.93]"
              style={{ background: badge.bg, color: badge.text }}
            >
              <span>{status}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>expand_more</span>
            </button>
          </div>

          {/* Tags: Referral + Resume */}
          {(referral || resume) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {referral && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium truncate max-w-[180px]"
                  style={{ background: 'rgba(120,120,128,0.10)', color: '#3C3C43' }}
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '11px' }}>person</span>
                  <span className="truncate">Ref: {referral}</span>
                </span>
              )}
              {resume && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-medium truncate max-w-[140px]"
                  style={{ background: 'rgba(0,122,255,0.08)', color: '#007AFF' }}
                >
                  <span className="material-symbols-outlined shrink-0" style={{ fontSize: '11px' }}>description</span>
                  <span className="truncate">{resume}</span>
                </span>
              )}
            </div>
          )}

          {/* Notes */}
          {notes && (
            <div
              onClick={() => setExpanded(!expanded)}
              className="text-[12px] rounded-[10px] px-3 py-2 cursor-pointer transition-colors duration-150 active:opacity-70"
              style={{ background: 'rgba(120,120,128,0.08)', color: '#3C3C43' }}
            >
              <p className={expanded ? 'break-words' : 'line-clamp-1'}>
                <span className="font-semibold" style={{ color: '#8E8E93' }}>Note: </span>
                {notes}
              </p>
            </div>
          )}

          {/* Footer */}
          <div
            className="pt-2.5 flex items-center justify-between text-[11px]"
            style={{ borderTop: '0.5px solid rgba(60,60,67,0.12)' }}
          >
            <span className="flex items-center gap-1.5 min-w-0" style={{ color: '#8E8E93' }}>
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: badge.text }}
              />
              <span className="truncate">{source}</span>
              <span>·</span>
              <span className="shrink-0">{formatDate(job.dateApplied)}</span>
            </span>

            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              disabled={updating}
              className="flex items-center gap-0.5 text-[12px] font-semibold transition-opacity active:opacity-50 shrink-0 ml-2"
              style={{ color: '#007AFF' }}
            >
              {updating
                ? <span className="material-symbols-outlined animate-spin" style={{ fontSize: '14px' }}>progress_activity</span>
                : <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit_note</span>
              }
              <span>{updating ? 'Updating…' : 'Update'}</span>
            </button>
          </div>
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
