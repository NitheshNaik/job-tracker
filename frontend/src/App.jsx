import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav  from './components/BottomNav';
import Dashboard  from './pages/Dashboard';
import AddJob     from './pages/AddJob';
import JobList    from './pages/JobList';
import Login      from './pages/Login';
import Register   from './pages/Register';

// ─── Full-screen spinner shown while the app checks a stored token ────────────
function SplashLoader() {
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center gap-4"
      style={{ background: '#F2F2F7' }}
    >
      <div
        className="w-16 h-16 rounded-[18px] flex items-center justify-center text-white text-[20px] font-bold"
        style={{
          background: 'linear-gradient(145deg, #339DFF, #007AFF)',
          boxShadow: '0 8px 24px rgba(0,122,255,0.35)',
        }}
      >
        JT
      </div>
      <span
        className="material-symbols-outlined animate-spin"
        style={{ fontSize: '24px', color: '#007AFF' }}
      >
        progress_activity
      </span>
    </div>
  );
}

// ─── ProtectedRoute — redirects to /login if not authenticated ────────────────
function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return <SplashLoader />;
  if (!token)  return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// ─── AuthRoute — redirects authenticated users away from login/register ───────
function AuthRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <SplashLoader />;
  if (token)   return <Navigate to="/" replace />;
  return children;
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
function AppShell() {
  const { token } = useAuth();

  return (
    <div className="flex h-dvh overflow-hidden items-start justify-center bg-[#E5E5EA] sm:py-8 sm:items-center md:h-screen md:w-screen md:p-0 md:bg-[#F2F2F7]">
      <div className="relative w-full max-w-[390px] h-dvh bg-[#F2F2F7] flex flex-col overflow-hidden sm:h-[844px] sm:max-h-[844px] sm:rounded-[52px] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] sm:border sm:border-white/20 md:max-w-none md:w-full md:h-screen md:max-h-none md:rounded-none md:shadow-none md:border-none md:flex-row md:overflow-hidden">

        {/* Scrollable page content */}
        <main className={`flex-1 overflow-y-auto min-h-0 ${token ? 'pb-16 md:ml-20 md:pb-8' : ''}`}>
          <Routes>
            {/* ── Public auth routes ── */}
            <Route path="/login"    element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            {/* ── Protected app routes ── */}
            <Route path="/"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add"  element={<ProtectedRoute><AddJob /></ProtectedRoute>} />
            <Route path="/jobs" element={<ProtectedRoute><JobList /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Bottom nav — only shown when authenticated */}
        {token && <BottomNav />}
      </div>
    </div>
  );
}

// ─── Root — wraps everything with AuthProvider ────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
