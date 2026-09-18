import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/jobApi';

// ─── Options (mirror backend schema enums exactly) ────────────────────────────
const STATUSES       = ['Applied', 'Assessment', 'Interviewing', 'Offer', 'Ghosted', 'Rejected'];
const SOURCES        = ['LinkedIn', 'Wellfound', 'Company Website', 'Referral', 'Cold Email', 'Other'];
const RESUME_OPTIONS = ['Full-Stack v2', 'Frontend v1', 'General'];

// ─── Small reusable components ────────────────────────────────────────────────
function ChipRow({ label, options, selected, onSelect }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary">{label}</label>
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 -mx-1 px-1 no-scrollbar">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-95 ${
              selected === opt
                ? 'bg-primary-container text-surface-container-lowest shadow-sm'
                : 'bg-surface-container-lowest text-secondary border border-[#ECEAE5] hover:border-secondary'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextInput({ label, icon, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
        {label}{required && <span className="text-error ml-0.5">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span className="material-symbols-outlined text-[18px] text-outline-variant absolute left-3.5 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full h-[46px] ${icon ? 'pl-10' : 'px-3.5'} pr-3.5 bg-surface-container-lowest border border-[#E4E4E7] rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container transition-colors shadow-[0_1px_3px_rgba(24,24,27,0.02)]`}
        />
      </div>
    </div>
  );
}

// ─── Error / success toast ────────────────────────────────────────────────────
function Toast({ type, message }) {
  const isError = type === 'error';
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-[360px] w-[calc(100%-2rem)] flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
      isError
        ? 'bg-error-container border-error/30 text-on-error-container'
        : 'bg-[#E6EFE9] border-[#2C5E3B]/20 text-[#1a3d26]'
    }`}>
      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        {isError ? 'error' : 'check_circle'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-snug break-words">{message}</p>
      </div>
    </div>
  );
}

const EMPTY = {
  companyName: '',
  company: '', // alias support
  jobTitle: '',
  title: '',   // alias support
  jobLink: '',
  referralContact: '',
  status: 'Applied',
  source: 'LinkedIn',
  resumeUsed: '',
  dateApplied: new Date().toISOString().split('T')[0],
  followUpDate: '',
  notes: '',
};

export default function AddJob() {
  const navigate = useNavigate();
  const [form,     setForm]     = useState({ ...EMPTY });
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(null); // { type: 'error'|'success', message }
  const [errors,   setErrors]   = useState({});   // field-level validation

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: val };
      // Keep aliases in sync
      if (field === 'companyName') next.company = val;
      if (field === 'company') next.companyName = val;
      if (field === 'jobTitle') next.title = val;
      if (field === 'title') next.jobTitle = val;
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const pick = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4500);
  }

  function validate() {
    const e = {};
    const companyVal = (form.companyName || form.company || '').trim();
    const titleVal   = (form.jobTitle || form.title || '').trim();

    if (!companyVal) e.companyName = 'Company name is required.';
    if (!titleVal)    e.jobTitle    = 'Job title is required.';
    if (form.jobLink && !/^https?:\/\/.+/.test(form.jobLink.trim())) {
      e.jobLink = 'Enter a valid URL (starting with http:// or https://).';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const companyName = (form.companyName || form.company || '').trim();
      const jobTitle    = (form.jobTitle || form.title || '').trim();

      // Explicitly map payload matching Mongoose schema in backend/src/models/JobApplication.js
      const payload = {
        companyName,
        jobTitle,
        status: form.status || 'Applied',
        source: form.source || 'Other',
      };

      // Only include optional fields if non-empty to prevent CastError/Validation failure
      if (form.jobLink?.trim())         payload.jobLink         = form.jobLink.trim();
      if (form.referralContact?.trim()) payload.referralContact = form.referralContact.trim();
      if (form.resumeUsed?.trim())      payload.resumeUsed      = form.resumeUsed.trim();
      if (form.notes?.trim())           payload.notes           = form.notes.trim();
      if (form.followUpDate)            payload.followUpDate    = form.followUpDate;
      if (form.dateApplied)             payload.dateApplied     = form.dateApplied;

      await api.post('/jobs', payload);
      showToast('success', 'Application saved successfully! 🎉');
      setTimeout(() => navigate('/jobs'), 800);
    } catch (err) {
      console.error('Add job submission error:', err);

      // Extract the real backend error (e.g. 400 Mongoose Validation Error)
      // instead of masking it as a network error
      let errorMsg = 'Failed to save application.';
      if (err.response?.data?.error) {
        errorMsg = typeof err.response.data.error === 'string'
          ? err.response.data.error
          : JSON.stringify(err.response.data.error);
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK') {
        errorMsg = 'Cannot connect to backend server. Is the server running on port 5000?';
      } else if (err.message) {
        errorMsg = err.message;
      }

      showToast('error', errorMsg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex flex-col min-h-full">
        {/* ── Header ─────────────────────────────────────────────────────────────── */}
        <header className="w-full bg-surface/90 backdrop-blur-md sticky top-0 z-40 px-3 py-2.5 flex items-center justify-between border-b border-outline-variant/30 shadow-[0_1px_3px_rgba(24,24,27,0.02)]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-secondary hover:text-primary transition-colors text-[14px] font-medium active:scale-95"
          >
            Cancel
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[17px] font-semibold text-primary tracking-tight">New Application</h1>
            <span className="text-[10px] text-secondary/70 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container inline-block" />
              Fill required fields (*)
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setForm({ ...EMPTY }); setErrors({}); }}
            className="text-primary-container text-[14px] hover:opacity-80 transition-opacity active:scale-95"
          >
            Reset
          </button>
        </header>

        {/* ── Form body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 px-3 pt-3 pb-24 space-y-5">

          {/* Text fields */}
          <section className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <TextInput
                label="Company Name"
                value={form.companyName}
                onChange={set('companyName')}
                placeholder="e.g. Acme Corp"
                required
              />
              {errors.companyName && (
                <span className="text-[11px] text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  {errors.companyName}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <TextInput
                label="Job Title"
                value={form.jobTitle}
                onChange={set('jobTitle')}
                placeholder="e.g. Senior Product Designer"
                required
              />
              {errors.jobTitle && (
                <span className="text-[11px] text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  {errors.jobTitle}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <TextInput
                label="Job Link"
                icon="link"
                type="url"
                value={form.jobLink}
                onChange={set('jobLink')}
                placeholder="https://..."
              />
              {errors.jobLink && (
                <span className="text-[11px] text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">warning</span>
                  {errors.jobLink}
                </span>
              )}
            </div>

            <TextInput
              label="Referral Contact"
              value={form.referralContact}
              onChange={set('referralContact')}
              placeholder="e.g. Jane Doe (optional)"
            />
          </section>

          {/* Chip selectors */}
          <section className="space-y-4 pt-1">
            <ChipRow label="Stage / Status"     options={STATUSES}       selected={form.status}     onSelect={(v) => pick('status', v)} />
            <ChipRow label="Application Source" options={SOURCES}        selected={form.source}     onSelect={(v) => pick('source', v)} />
            <ChipRow label="Resume Version"     options={RESUME_OPTIONS} selected={form.resumeUsed} onSelect={(v) => pick('resumeUsed', v)} />
          </section>

          {/* Dates + Notes */}
          <section className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Date Applied"
                icon="event"
                type="date"
                value={form.dateApplied}
                onChange={set('dateApplied')}
              />
              <TextInput
                label="Follow-up Date"
                icon="calendar_today"
                type="date"
                value={form.followUpDate}
                onChange={set('followUpDate')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-secondary">
                Notes &amp; Highlights
              </label>
              <textarea
                value={form.notes}
                onChange={set('notes')}
                placeholder="Key requirements, recruiter notes, salary range…"
                rows={3}
                className="w-full p-3.5 bg-surface-container-lowest border border-[#E4E4E7] rounded-xl text-[14px] text-on-surface placeholder:text-outline-variant focus:outline-none focus:border-primary-container transition-colors resize-none shadow-[0_1px_3px_rgba(24,24,27,0.02)]"
              />
            </div>
          </section>
        </div>

        {/* ── Sticky save CTA ────────────────────────────────────────────────────── */}
        <div
          className="sticky bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md px-3 pt-3 shadow-[0_-4px_16px_rgba(23,40,55,0.04)] z-30"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-primary-container text-surface-container-lowest font-semibold text-[16px] rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-150 shadow-md hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                <span>Saving to Database…</span>
              </>
            ) : (
              <>
                <span>Save Application</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
