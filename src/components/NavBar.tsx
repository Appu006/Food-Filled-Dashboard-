import { NavLink } from 'react-router-dom';
import { Map, PackagePlus, Building2, Citrus } from 'lucide-react';
import { WaveDivider } from './WaveDivider';

const links = [
  { to: '/', label: 'Impact Heatmap', icon: Map, end: true },
  { to: '/record', label: 'Record a Delivery', icon: PackagePlus },
  { to: '/agencies', label: 'Manage Agencies', icon: Building2 },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-[1000]">
      <div className="border-b-2 border-brand-ink bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 pr-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-ink bg-brand-orange text-white shadow-[2px_2px_0_#111]">
              <Citrus size={20} strokeWidth={2.5} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-brand-navy">FoodFilled Impact</p>
              <p className="text-[11px] font-medium text-brand-navy/60">Prototype dashboard</p>
            </div>
          </div>
          <nav className="flex flex-1 items-center gap-1.5 overflow-x-auto">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'border-brand-ink bg-brand-orange text-white shadow-[2px_2px_0_#111]'
                      : 'border-transparent text-brand-navy/70 hover:border-brand-ink/20 hover:bg-brand-lavender/50 hover:text-brand-navy'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden shrink-0 rounded-full border-2 border-brand-ink bg-brand-green px-3 py-1 text-xs font-bold text-white sm:inline">
            No login required
          </span>
        </div>
      </div>
      <WaveDivider fill="var(--color-brand-lavender)" />
    </header>
  );
}
