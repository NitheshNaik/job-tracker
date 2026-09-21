import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/jobApi';

// ─── Options (mirror backend schema enums exactly) ────────────────────────────
const STATUSES       = ['Applied', 'Assessment', 'Interviewing', 'Offer', 'Ghosted', 'Rejected'];
const SOURCES        = ['LinkedIn', 'Wellfound', 'Company Website', 'Referral', 'Cold Email', 'Other'];
const RESUME_OPTIONS = ['Full-Stack v2', 'Frontend v1', 'General'];

// ─── iOS Filled Input ─────────────────────────────────────────────────────────
function TextInput({ label, icon, type = 'text', value, onChange, placeholder, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: '#8E8E93' }}
      >
        {label}
        {required && <span style={{ color: '#FF3B30' }} className="ml-0.5">*</span>}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span
            className="material-symbols-outlined absolute left-3 pointer-events-none"
            style={{ fontSize: '17px', color: focused ? '#007AFF' : '#8E8E93' }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="w-full h-[46px] text-[15px] rounded-[10px] outline-none transition-all duration-200"
          style={{
            background: 'rgba(120,120,128,0.12)',
            color: '#000',
            paddingLeft: icon ? '2.5rem' : '0.875rem',
            paddingRight: '0.875rem',
            caretColor: '#007AFF',
            boxShadow: focused ? 'inset 0 0 0 1.5px #007AFF' : 'none',
          }}
        />
      </div>
    </div>
  );
}

// ─── iOS Pill Chip Row ────────────────────────────────────────────────────────
function ChipRow({ label, options, selected, onSelect }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8E8E93' }}>
        {label}
      </label>
      <div className="flex items-center gap-2 overflow-x-auto py-0.5 -mx-1 px-1 no-scrollbar">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className="whitespace-nowrap px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 active:scale-[0.93] select-none"
            style={
              selected === opt
                ? { background: '#007AFF', color: '#FFFFFF' }
                : { background: 'rgba(120,120,128,0.12)', color: '#3C3C43' }
            }
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── iOS-style Toast ──────────────────────────────────────────────────────────
function Toast({ type, message }) {
  const isError = type === 'error';
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-[360px] w-[calc(100%-2rem)] flex items-start gap-3 px-4 py-3.5 animate-fadeIn"
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        border: `1px solid ${isError ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)'}`,
      }}
    >
      <span
        className="material-symbols-outlined shrink-0 mt-0.5"
        style={{
          fontSize: '20px',
          color: isError ? '#FF3B30' : '#34C759',
          fontVariationSettings: "'FILL' 1",
        }}
      >
        {isError ? 'error' : 'check_circle'}
      </span>
      <p className="text-[13px] font-medium leading-snug break-words" style={{ color: '#000' }}>
        {message}
      </p>
    </div>
  );
}

const EMPTY = {
  companyName:     '',
  company:         '',
  jobTitle:        '',
  title:           '',
  jobLink:         '',
  referralContact: '',
  status:          'Applied',
  source:          'LinkedIn',
  resumeUsed:      '',
  dateApplied:     new Date().toISOString().split('T')[0],
  followUpDate:    '',
  notes:           '',
};

export default function AddJob() {
  const navigate = useNavigate();
  const [form,   setForm]   = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast,  setToast]  = useState(null);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const val = e.target.value;
    setForm((f) => {
      const next = { ...f, [field]: val };
      if (field === 'companyName') next.company  = val;
      if (field === 'company')     next.companyName = val;
      if (field === 'jobTitle')    next.title    = val;
      if (field === 'title')       next.jobTitle = val;
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
    if (!titleVal)   e.jobTitle    = 'Job title is required.';
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
      const payload = {
        companyName,
        jobTitle,
        status: form.status || 'Applied',
        source: form.source || 'Other',
      };
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

        {/* ── iOS Modal Navigation Bar ──────────────────────────────────────── */}
        <header
          className="w-full sticky top-0 z-40 flex items-center justify-between px-4 pt-12 pb-3"
          style={{
            background: 'rgba(242,242,247,0.90)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderBottom: '0.5px solid rgba(60,60,67,0.18)',
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[17px] font-normal transition-opacity active:opacity-50"
            style={{ color: '#007AFF' }}
          >
            Cancel
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-[17px] font-semibold tracking-tight" style={{ color: '#000' }}>
              New Application
            </h1>
            <span className="text-[11px]" style={{ color: '#8E8E93' }}>
              Fill required fields (*)
            </span>
          </div>

          <button
            type="button"
            onClick={() => { setForm({ ...EMPTY }); setErrors({}); }}
            className="text-[17px] font-normal transition-opacity active:opacity-50"
            style={{ color: '#007AFF' }}
          >
            Reset
          </button>
        </header>

        {/* ── Form body ─────────────────────────────────────────────────────── */}
        <div className="flex-1 px-4 pt-5 pb-28 space-y-6">

          {/* Text fields */}
          <section
            className="rounded-[16px] overflow-hidden divide-y"
            style={{ background: '#FFFFFF', boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)', divideColor: 'rgba(60,60,67,0.10)' }}
          >
            <div className="p-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <TextInput
                  label="Company Name"
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="e.g. Acme Corp"
                  required
                />
                {errors.companyName && (
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#FF3B30' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
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
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#FF3B30' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
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
                  <span className="text-[11px] flex items-center gap-1" style={{ color: '#FF3B30' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>warning</span>
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
            </div>
          </section>

          {/* Chip selectors */}
          <section className="space-y-5">
            <ChipRow label="Stage / Status"     options={STATUSES}       selected={form.status}     onSelect={(v) => pick('status', v)} />
            <ChipRow label="Application Source" options={SOURCES}        selected={form.source}     onSelect={(v) => pick('source', v)} />
            <ChipRow label="Resume Version"     options={RESUME_OPTIONS} selected={form.resumeUsed} onSelect={(v) => pick('resumeUsed', v)} />
          </section>

          {/* Dates + Notes */}
          <section
            className="rounded-[16px] overflow-hidden"
            style={{ background: '#FFFFFF', boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div className="p-4 space-y-4">
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
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8E8E93' }}>
                  Notes &amp; Highlights
                </label>
                <textarea
                  value={form.notes}
                  onChange={set('notes')}
                  placeholder="Key requirements, recruiter notes, salary range…"
                  rows={3}
                  className="w-full p-3.5 text-[15px] rounded-[10px] resize-none outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(120,120,128,0.12)',
                    color: '#000',
                    caretColor: '#007AFF',
                  }}
                />
              </div>
            </div>
          </section>
        </div>

        {/* ── Sticky Save CTA ─────────────────────────────────────────────────── */}
        <div
          className="sticky bottom-0 left-0 right-0 px-4 pt-3 z-30"
          style={{
            paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
            background: 'rgba(242,242,247,0.92)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            borderTop: '0.5px solid rgba(60,60,67,0.15)',
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full h-[52px] font-semibold text-[17px] text-white rounded-[14px] flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed select-none"
            style={{
              background: saving
                ? '#339DFF'
                : 'linear-gradient(180deg, #339DFF 0%, #007AFF 100%)',
              boxShadow: '0 4px 16px rgba(0,122,255,0.4), 0 1px 4px rgba(0,122,255,0.2)',
            }}
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-white animate-spin" style={{ fontSize: '20px' }}>
                  progress_activity
                </span>
                <span>Saving to Database…</span>
              </>
            ) : (
              <>
                <span>Save Application</span>
                <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
