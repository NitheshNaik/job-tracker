import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddJob from './pages/AddJob';
import JobList from './pages/JobList';

export default function App() {
  return (

    <div className="flex min-h-dvh items-start justify-center bg-[#eae8e3] sm:py-8">
      <div className="relative w-full max-w-[375px] min-h-dvh bg-background flex flex-col overflow-hidden sm:min-h-[812px] sm:rounded-[44px] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2)] sm:border sm:border-outline-variant/30">
        {/* Scrollable page content — pb clears the fixed bottom nav */}
        <main className="flex-1 overflow-y-auto pb-[4.5rem]">
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
