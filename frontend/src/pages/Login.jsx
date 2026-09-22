import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── iOS Filled Input ─────────────────────────────────────────────────────────
function AuthInput({ label, icon, type = 'text', value, onChange, placeholder, autoComplete }) {
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
            style={{ fontSize: '18px', color: focused ? '#007AFF' : '#8E8E93' }}
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
            background: 'rgba(120,120,128,0.12)',
            color: '#000',
            paddingLeft: icon ? '2.75rem' : '1rem',
            paddingRight: '1rem',
            caretColor: '#007AFF',
            boxShadow: focused ? 'inset 0 0 0 1.5px #007AFF' : 'none',
          }}
        />
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.error);
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: '#F2F2F7' }}
    >
      {/* ── Top spacer / decorative header ─────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex flex-col items-center justify-end px-6 pb-8"
        style={{ paddingTop: 'max(4rem, env(safe-area-inset-top) + 2rem)', minHeight: '220px' }}
      >
        {/* App icon */}
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
          className="text-[32px] font-bold text-center"
          style={{ color: '#000', letterSpacing: '-0.02em', lineHeight: 1.1 }}
        >
          Welcome back.
        </h1>
        <p className="text-[15px] mt-1.5 text-center" style={{ color: '#8E8E93' }}>
          Sign in to continue tracking your journey.
        </p>
      </div>

      {/* ── Form card ────────────────────────────────────────────────────────── */}
      <div className="flex-1 px-5 pb-10 space-y-4">
        <div
          className="rounded-[20px] p-5 space-y-4"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <AuthInput
              label="Email"
              icon="mail"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <AuthInput
              label="Password"
              icon="lock"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              placeholder="••••••••"
              autoComplete="current-password"
            />

            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[13px] font-medium"
                style={{ background: 'rgba(255,59,48,0.10)', color: '#FF3B30' }}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                {error}
              </div>
            )}

            {/* Submit */}
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
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[14px]" style={{ color: '#8E8E93' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold transition-opacity active:opacity-50"
            style={{ color: '#007AFF' }}
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
