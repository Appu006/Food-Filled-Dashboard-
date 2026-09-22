import { NavLink } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import foodfilledLogo from '../assets/foodfilled-logo.png';

const links = [
  { to: '/', label: 'Impact Heatmap', end: true },
  { to: '/agencies', label: 'Manage Agencies', end: false },
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-[1000] backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <img src={foodfilledLogo} alt="FoodFilled Inc." className="h-12 w-auto sm:h-14" />
          <span className="hidden text-[11px] font-bold uppercase tracking-wide text-brand-navy/50 sm:inline">
            Prototype dashboard
          </span>
        </div>
        <nav className="flex flex-1 items-center gap-6 overflow-x-auto">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap font-display text-sm font-semibold uppercase tracking-wide transition-colors ${
                  isActive ? 'text-brand-orange' : 'text-brand-navy/80 hover:text-brand-orange'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/record"
          className={({ isActive }) =>
            `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-brand-ink px-4 py-2 font-display text-sm font-semibold uppercase text-white shadow-[2px_2px_0_#111] transition-colors ${
              isActive ? 'bg-brand-orange-dark' : 'bg-brand-purple hover:bg-brand-purple/90'
            }`
          }
        >
          <PackagePlus size={16} /> Record a Delivery
        </NavLink>
      </div>
    </header>
  );
}
