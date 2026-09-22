import { NavLink } from 'react-router-dom';
import { Map, PackagePlus, Building2, Sprout } from 'lucide-react';

const links = [
  { to: '/', label: 'Impact Heatmap', icon: Map, end: true },
  { to: '/record', label: 'Record a Delivery', icon: PackagePlus },
  { to: '/agencies', label: 'Manage Agencies', icon: Building2 },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-emerald-900/10 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2 pr-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white">
            <Sprout size={18} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-emerald-950">Food Rescue Impact</p>
            <p className="text-[11px] text-emerald-700/70">Prototype dashboard</p>
          </div>
        </div>
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <span className="hidden shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 sm:inline">
          No login required — prototype build
        </span>
      </div>
    </header>
  );
}
