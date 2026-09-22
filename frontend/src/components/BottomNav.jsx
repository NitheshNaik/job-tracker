import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/',     label: 'Dashboard', icon: 'grid_view',  end: true, orderClass: 'md:order-1' },
  { to: '/add',  label: 'Add',       icon: 'add',        isAdd: true, orderClass: 'md:order-3' },
  { to: '/jobs', label: 'Jobs',      icon: 'work',       orderClass: 'md:order-2' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Main Navigation"
      className="absolute bottom-0 left-0 right-0 w-full z-50 flex items-center justify-around px-6 border-t border-[rgba(60,60,67,0.18)] md:fixed md:top-0 md:left-0 md:bottom-0 md:w-20 md:h-screen md:flex-col md:justify-start md:items-center md:px-0 md:py-8 md:border-t-0 md:border-r md:border-[rgba(60,60,67,0.12)] md:bg-white/70 md:backdrop-blur-xl"
      style={{
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))',
        paddingTop: '0.625rem',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* ── Top App Brand Mark on Desktop ── */}
      <div
        className="hidden md:flex items-center justify-center w-10 h-10 rounded-[12px] text-white text-[14px] font-bold shrink-0 mb-8 select-none shadow-[0_2px_8px_rgba(0,122,255,0.35)]"
        style={{ background: 'linear-gradient(145deg, #339DFF, #007AFF)' }}
        title="Job Tracker"
      >
        JT
      </div>

      {/* ── Navigation Items with Increased Bottom Padding and Namings ── */}
      <div className="flex items-center justify-around w-full md:flex-col md:items-center md:w-full">
        {tabs.map(({ to, label, icon, end, isAdd, orderClass }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={label}
            aria-label={label}
            className={({ isActive }) =>
              `relative flex items-center justify-center transition-all duration-150 active:scale-90 select-none ${orderClass} md:w-full md:flex-col md:items-center md:pb-6`
            }
          >
            {({ isActive }) =>
              isAdd ? (
                <div className="flex flex-col items-center">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 shadow-[0_3px_12px_rgba(0,122,255,0.38)]"
                    style={{
                      background: isActive
                        ? 'linear-gradient(145deg, #1A8FFF, #007AFF)'
                        : 'linear-gradient(145deg, #339DFF, #007AFF)',
                    }}
                  >
                    <span
                      className="material-symbols-outlined text-white"
                      style={{ fontSize: '22px', fontVariationSettings: "'wght' 500" }}
                    >
                      add
                    </span>
                  </div>
                  <span
                    className={`hidden md:block text-[11px] font-semibold tracking-tight mt-1.5 transition-colors duration-150 ${
                      isActive ? 'text-[#007AFF]' : 'text-[#8E8E93]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 md:rounded-[12px] ${
                      isActive
                        ? 'bg-[rgba(0,122,255,0.10)] md:bg-[rgba(0,122,255,0.12)] text-[#007AFF]'
                        : 'bg-transparent text-[#8E8E93] md:hover:text-[#000] md:hover:bg-[rgba(120,120,128,0.08)]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined transition-all duration-150"
                      style={{
                        fontSize: '24px',
                        color: isActive ? '#007AFF' : '#8E8E93',
                        fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                      }}
                    >
                      {icon}
                    </span>
                  </div>
                  <span
                    className={`hidden md:block text-[11px] font-medium tracking-tight mt-1.5 transition-colors duration-150 ${
                      isActive ? 'text-[#007AFF] font-semibold' : 'text-[#8E8E93]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              )
            }
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
