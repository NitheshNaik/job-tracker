import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import JobList from './pages/JobList';

export default function App() {
  return (
    <div className="flex min-h-dvh items-start justify-center bg-[#E5E5EA] sm:py-8">
      <div className="relative w-full max-w-[390px] min-h-dvh bg-[#F2F2F7] flex flex-col overflow-hidden sm:min-h-[844px] sm:rounded-[52px] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.08)] sm:border sm:border-white/20">
        {/* Scrollable page content — pb clears the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto pb-[5rem]">
          <Routes>
            <Route path="/"     element={<Dashboard />} />
            <Route path="/add"  element={<AddJob />} />
            <Route path="/jobs" element={<JobList />} />
          </Routes>
        </main>

        {/* Persistent bottom navigation — absolute so it stays inside the frame */}
        <BottomNav />
      </div>
    </div>
  );
}
