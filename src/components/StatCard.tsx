import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone = 'emerald',
}: {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  tone?: 'emerald' | 'amber' | 'sky';
}) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
  } as const;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-900/10 bg-white p-4 shadow-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-emerald-900/60">{label}</p>
        <p className="truncate text-xl font-semibold text-emerald-950">{value}</p>
        {sub && <p className="text-xs text-emerald-900/50">{sub}</p>}
      </div>
    </div>
  );
}
