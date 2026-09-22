import type { Agency, DeliveryEntry } from '../data/types';
import { isSameMonth } from './date';

export interface WeekBucket {
  label: string;
  [agencyName: string]: number | string;
}

// Groups this month's deliveries into week-of-month buckets, kg per agency,
// for the trend chart on the dashboard. Purely a presentation aid over data
// that's already required to be stored (weight + date per entry).
export function weeklyDeliveryTrend(
  agencies: Agency[],
  entries: DeliveryEntry[],
  now: Date = new Date(),
): WeekBucket[] {
  const monthEntries = entries.filter((e) => isSameMonth(e.date, now));
  const weekCount = Math.ceil(now.getDate() / 7) || 1;
  const buckets: WeekBucket[] = Array.from({ length: weekCount }, (_, i) => ({
    label: `Week ${i + 1}`,
  }));

  for (const agency of agencies) {
    for (const bucket of buckets) {
      bucket[agency.name] = 0;
    }
  }

  for (const entry of monthEntries) {
    const weekIndex = Math.floor((entry.date.getDate() - 1) / 7);
    const bucket = buckets[Math.min(weekIndex, buckets.length - 1)];
    const agency = agencies.find((a) => a.id === entry.agencyId);
    if (!agency || !bucket) continue;
    bucket[agency.name] = ((bucket[agency.name] as number) ?? 0) + entry.weightKg;
  }

  return buckets;
}
