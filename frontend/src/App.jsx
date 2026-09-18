import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import JobList from './pages/JobList';

export default function App() {
  return (
    /*
     * Full-height shell. max-w-md + mx-auto keeps the layout intentional
     * on desktop while staying mobile-first at the base breakpoint.
     * pb-20 reserves space for the fixed bottom nav (≈80px).
     */
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col bg-[var(--color-surface)]">
      {/* ── Routed page content ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/"      element={<Dashboard />} />
          <Route path="/add"   element={<AddJob />} />
          <Route path="/jobs"  element={<JobList />} />
        </Routes>
      </main>

      {/* ── Persistent bottom navigation ───────────────────────────────────── */}
      <BottomNav />
    </div>
  );
}
