import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/',     label: 'Dashboard', icon: 'grid_view',  end: true },
  { to: '/add',  label: 'Add Job',   icon: 'add',        isAdd: true },
  { to: '/jobs', label: 'Jobs',      icon: 'work' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Main Navigation"
      className="absolute bottom-0 left-0 right-0 w-full z-50 flex items-center justify-around px-6"
      style={{
        paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))',
        paddingTop: '0.625rem',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '0.5px solid rgba(60,60,67,0.18)',
      }}
    >
      {tabs.map(({ to, label, icon, end, isAdd }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          aria-label={label}
          className="relative flex items-center justify-center transition-all duration-150 active:scale-90 select-none"
        >
          {({ isActive }) =>
            isAdd ? (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95"
                style={{
                  background: isActive
                    ? 'linear-gradient(145deg, #1A8FFF, #007AFF)'
                    : 'linear-gradient(145deg, #339DFF, #007AFF)',
                  boxShadow: '0 3px 12px rgba(0,122,255,0.38), 0 1px 3px rgba(0,122,255,0.2)',
                }}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontSize: '24px', fontVariationSettings: "'wght' 500" }}
                >
                  add
                </span>
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{
                  background: isActive ? 'rgba(0,122,255,0.10)' : 'transparent',
                }}
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
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
