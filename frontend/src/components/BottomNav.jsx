import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/',     label: 'Dashboard', icon: 'grid_view', end: true },
  { to: '/add',  label: 'Add',       icon: 'add',       isAdd: true },
  { to: '/jobs', label: 'Jobs',      icon: 'work' },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Main Navigation"
      className="absolute bottom-0 left-0 right-0 w-full z-50 flex items-center justify-around px-3 py-2 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-4px_16px_rgba(23,40,55,0.04)]"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      {tabs.map(({ to, label, icon, end, isAdd }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors duration-150 active:scale-95 ${
              isActive
                ? 'text-primary-container font-semibold'
                : 'text-secondary hover:text-primary'
            }`
          }
        >
          {({ isActive }) =>
            isAdd ? (
              <>
                <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md -mt-3 mb-0.5">
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <span className="text-[10px] font-semibold tracking-tight">{label}</span>
              </>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                <span className="text-[10px] font-semibold tracking-tight">{label}</span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-primary-container absolute -bottom-0.5" />
                )}
              </>
            )
          }
        </NavLink>
      ))}
    </nav>
  );
}
