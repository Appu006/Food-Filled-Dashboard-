import { NavLink } from 'react-router-dom';
import { PackagePlus } from 'lucide-react';
import foodfilledIcon from '../assets/foodfilled-icon.png';

const links = [
  { to: '/', label: 'Impact Heatmap', end: true },
  { to: '/agencies', label: 'Manage Agencies', end: false },
];

export function NavBar() {
  return (
    <header className="sticky top-3.5 z-[1000] rounded-2xl border-2 border-brand-ink bg-white shadow-[3px_3px_0_#111]">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5 pr-2">
          <img src={foodfilledIcon} alt="FoodFilled" className="h-11 w-auto" />
          <div className="leading-tight">
            <p className="font-display text-base font-semibold text-brand-navy">FoodFilled Impact</p>
            <p className="text-[11px] font-medium text-brand-navy/60">Prototype dashboard</p>
          </div>
        </div>
        <nav className="flex flex-1 items-center gap-6 overflow-x-auto">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `whitespace-nowrap text-sm font-bold uppercase tracking-wide transition-colors ${
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
            `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border-2 border-brand-ink px-4 py-2 text-sm font-bold uppercase text-white shadow-[2px_2px_0_#111] transition-colors ${
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
