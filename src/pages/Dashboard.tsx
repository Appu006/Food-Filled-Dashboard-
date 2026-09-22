import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Building2, PackageCheck, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { HeatMapView } from '../components/HeatMapView';
import { StatCard } from '../components/StatCard';
import { computeAgencyImpacts, impactBand } from '../lib/calculations';
import { weeklyDeliveryTrend } from '../lib/trends';
import { currentMonthLabel, formatDateTime, isSameMonth } from '../lib/date';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const CHART_COLORS = ['#f5820e', '#16204a', '#9b4de0', '#39b44a', '#4a55c9'];

export function Dashboard() {
  const { agencies, activeAgencies, deliveries } = useData();
  const now = new Date();

  const impacts = useMemo(() => computeAgencyImpacts(activeAgencies, deliveries, now), [activeAgencies, deliveries]);
  const points = useMemo(
    () =>
      impacts.map((i) => ({
        id: i.agency.id,
        name: i.agency.name,
        lat: i.agency.lat,
        lng: i.agency.lng,
        contribution: i.contribution,
        band: impactBand(i.contribution).label,
      })),
    [impacts],
  );

  const monthEntries = useMemo(() => deliveries.filter((d) => isSameMonth(d.date, now)), [deliveries]);
  const totalKgThisMonth = monthEntries.reduce((sum, e) => sum + e.weightKg, 0);
  const trend = useMemo(() => weeklyDeliveryTrend(activeAgencies, deliveries, now), [activeAgencies, deliveries]);
  const recent = useMemo(() => deliveries.slice(0, 6), [deliveries]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl font-semibold text-brand-navy">Impact overview</h1>
        <p className="text-sm font-medium text-brand-navy/60">
          Live snapshot for {currentMonthLabel(now)}. Resets automatically at the start of each month (BR-02).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Scale} label="Delivered this month" value={`${totalKgThisMonth.toFixed(0)} kg`} sub={`${monthEntries.length} entries logged`} tone="orange" />
        <StatCard icon={Building2} label="Active partner agencies" value={String(activeAgencies.length)} sub={`${agencies.length - activeAgencies.length} inactive`} tone="navy" />
        <StatCard
          icon={TrendingUp}
          label="Highest impact agency"
          value={impacts.length ? impacts.slice().sort((a, b) => b.contribution - a.contribution)[0].agency.name : '—'}
          sub={impacts.length ? impactBand(impacts.slice().sort((a, b) => b.contribution - a.contribution)[0].contribution).label : undefined}
          tone="purple"
        />
        <StatCard icon={PackageCheck} label="Packages logged today" value={String(monthEntries.filter((e) => e.date.toDateString() === now.toDateString()).length)} sub="via the volunteer entry form" tone="green" />
      </div>

      <HeatMapView points={points} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border-2 border-brand-ink bg-white p-4 shadow-[3px_3px_0_#111] lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-brand-navy">Weekly kg delivered, by agency</h2>
            <span className="text-xs font-medium text-brand-navy/50">{currentMonthLabel(now)}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#16204a' }} axisLine={{ stroke: '#cdd0f6' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#16204a' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)} kg`, undefined]}
                  contentStyle={{ borderRadius: 8, border: '2px solid #111', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {activeAgencies.map((agency, i) => (
                  <Bar key={agency.id} dataKey={agency.name} stackId="kg" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === activeAgencies.length - 1 ? [4, 4, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-brand-ink bg-white p-4 shadow-[3px_3px_0_#111] lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-brand-navy">Recent deliveries</h2>
            <Link to="/record" className="flex items-center gap-1 text-xs font-bold text-brand-orange hover:underline">
              Record one <ArrowUpRight size={12} />
            </Link>
          </div>
          <ul className="flex flex-col divide-y divide-brand-ink/10">
            {recent.length === 0 && <p className="py-4 text-sm text-brand-navy/50">No deliveries recorded yet.</p>}
            {recent.map((entry) => {
              const agency = agencies.find((a) => a.id === entry.agencyId);
              return (
                <li key={entry.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-brand-navy">{agency?.name ?? 'Removed agency'}</p>
                    <p className="text-xs text-brand-navy/50">{formatDateTime(entry.date)}</p>
                  </div>
                  <span className="shrink-0 rounded-full border-2 border-brand-ink bg-brand-lavender px-2 py-0.5 text-xs font-bold text-brand-navy">
                    {entry.weightKg} kg
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
