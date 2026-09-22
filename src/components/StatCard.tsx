import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'orange',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: 'orange' | 'navy' | 'purple' | 'green';
}) {
  const tones = {
    orange: 'bg-brand-orange text-white',
    navy: 'bg-brand-navy text-white',
    purple: 'bg-brand-purple text-white',
    green: 'bg-brand-green text-white',
  } as const;

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-brand-ink bg-white p-4 shadow-[3px_3px_0_#111]">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-ink ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-navy/60">{label}</p>
        <p className="truncate font-display text-xl font-semibold text-brand-navy">{value}</p>
        {sub && <p className="text-xs font-medium text-brand-navy/50">{sub}</p>}
      </div>
    </div>
  );
}
