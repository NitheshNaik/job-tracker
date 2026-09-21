import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/',     label: 'Dashboard', icon: 'grid_view',  end: true },
  { to: '/add',  label: 'Add',       icon: 'add',        isAdd: true },
  { to: '/jobs', label: 'Jobs',      icon: 'work' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Main Navigation"
      className="absolute bottom-0 left-0 right-0 w-full z-50 flex items-center justify-around px-2"
      style={{
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        paddingTop: '0.5rem',
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '0.5px solid rgba(60,60,67,0.20)',
      }}
    >
      {tabs.map(({ to, label, icon, end, isAdd }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-4 transition-all duration-150 active:scale-[0.88] select-none"
        >
          {({ isActive }) =>
            isAdd ? (
              <>
                {/* iOS-style floating add button */}
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center -mt-6 mb-0.5 transition-all duration-150 active:scale-90"
                  style={{
                    background: isActive
                      ? 'linear-gradient(145deg, #1A8FFF, #007AFF)'
                      : 'linear-gradient(145deg, #339DFF, #007AFF)',
                    boxShadow: '0 4px 16px rgba(0,122,255,0.45), 0 1px 3px rgba(0,122,255,0.3)',
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
                  className="text-[10px] font-semibold tracking-tight"
                  style={{ color: isActive ? '#007AFF' : '#8E8E93' }}
                >
                  {label}
                </span>
              </>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-8 h-8">
                  {/* Active indicator pill */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-xl"
                      style={{ background: 'rgba(0,122,255,0.12)' }}
                    />
                  )}
                  <span
                    className="material-symbols-outlined relative z-10"
                    style={{
                      fontSize: '22px',
                      color: isActive ? '#007AFF' : '#8E8E93',
                      fontVariationSettings: isActive ? "'FILL' 1, 'wght' 500" : "'FILL' 0, 'wght' 400",
                      transition: 'color 0.15s ease, font-variation-settings 0.15s ease',
                    }}
                  >
                    {icon}
                  </span>
                </div>
                <span
                  className="text-[10px] font-semibold tracking-tight transition-colors duration-150"
                  style={{ color: isActive ? '#007AFF' : '#8E8E93' }}
                >
                  {label}
                </span>
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
