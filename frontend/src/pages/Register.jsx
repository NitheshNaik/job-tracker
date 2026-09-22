import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── iOS Filled Input ─────────────────────────────────────────────────────────
function AuthInput({ label, icon, type = 'text', value, onChange, placeholder, autoComplete, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8E8E93' }}>
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && (
          <span
            className="material-symbols-outlined absolute left-3 pointer-events-none transition-colors duration-150"
            style={{ fontSize: '18px', color: error ? '#FF3B30' : focused ? '#007AFF' : '#8E8E93' }}
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
          autoComplete={autoComplete}
          className="w-full h-[50px] text-[15px] rounded-[12px] outline-none transition-all duration-200"
          style={{
            background: error ? 'rgba(255,59,48,0.06)' : 'rgba(120,120,128,0.12)',
            color: '#000',
            paddingLeft: icon ? '2.75rem' : '1rem',
            paddingRight: '1rem',
            caretColor: '#007AFF',
            boxShadow: error
              ? 'inset 0 0 0 1.5px rgba(255,59,48,0.5)'
              : focused ? 'inset 0 0 0 1.5px #007AFF' : 'none',
          }}
        />
      </div>
      {error && (
        <p className="text-[11px] flex items-center gap-1" style={{ color: '#FF3B30' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>warning</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors,  setErrors]  = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: '' }));
    setApiError('');
  };

  function validate() {
    const e = {};
    if (!form.name.trim())     e.name     = 'Name is required.';
    if (!form.email.trim())    e.email    = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (!form.password)        e.password = 'Password is required.';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters.';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setApiError(result.error);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col md:justify-center md:items-center md:py-12" style={{ background: '#F2F2F7' }}>

      {/* ── Top header ───────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-end px-6 pb-6 md:pt-0 md:min-h-0"
        style={{ paddingTop: 'max(3.5rem, env(safe-area-inset-top) + 1.5rem)', minHeight: '190px' }}
      >
        <div
          className="w-16 h-16 rounded-[18px] flex items-center justify-center text-white text-[20px] font-bold mb-4"
          style={{
            background: 'linear-gradient(145deg, #339DFF, #007AFF)',
            boxShadow: '0 8px 24px rgba(0,122,255,0.35)',
          }}
        >
          JT
        </div>
        <h1
          className="text-[30px] font-bold text-center"
          style={{ color: '#000', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Create your account.
        </h1>
        <p className="text-[14px] mt-1.5 text-center" style={{ color: '#8E8E93' }}>
          Start tracking your job search in seconds.
        </p>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-10 space-y-4 md:flex-initial md:w-full md:max-w-md md:px-0 md:pb-0">
        <div
          className="rounded-[20px] p-5 space-y-4"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthInput
              label="Name"
              icon="person"
              value={form.name}
              onChange={set('name')}
              placeholder="Jane Doe"
              autoComplete="name"
              error={errors.name}
            />
            <AuthInput
              label="Email"
              icon="mail"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />
            <AuthInput
              label="Password"
              icon="lock"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="Min. 6 characters"
              autoComplete="new-password"
              error={errors.password}
            />
            <AuthInput
              label="Confirm Password"
              icon="lock_reset"
              type="password"
              value={form.confirm}
              onChange={set('confirm')}
              placeholder="Repeat your password"
              autoComplete="new-password"
              error={errors.confirm}
            />

            {/* API error */}
            {apiError && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] font-medium"
                style={{ background: 'rgba(255,59,48,0.10)', color: '#FF3B30' }}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[52px] rounded-[14px] text-white text-[17px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: 'linear-gradient(180deg, #339DFF 0%, #007AFF 100%)',
                boxShadow: '0 4px 16px rgba(0,122,255,0.4)',
              }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '20px' }}>
                    progress_activity
                  </span>
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-[14px]" style={{ color: '#8E8E93' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold transition-opacity active:opacity-50"
            style={{ color: '#007AFF' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
