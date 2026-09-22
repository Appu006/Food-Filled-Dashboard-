import type { Agency, DeliveryEntry } from './types';

// FR-10 / BR-09: the system launches with exactly these three agencies.
// They are fully editable/removable from the Manage Agencies screen.
export const SEED_AGENCIES: Omit<Agency, 'createdAt'>[] = [
  {
    id: 'agency-sacred-heart',
    name: 'Sacred Heart Mission Dining Hall',
    address: '87 Grey Street, St Kilda VIC 3182',
    lat: -37.8663,
    lng: 144.9822,
    monthlyMeals: 6000,
    active: true,
  },
  {
    id: 'agency-christ-church',
    name: 'Christ Church Community Centre',
    address: '41 Acland Street, St Kilda VIC 3182',
    lat: -37.8657,
    lng: 144.9794,
    monthlyMeals: 1200,
    active: true,
  },
  {
    id: 'agency-uniting',
    name: 'Uniting Vic.Tas St Kilda Engagement Hub',
    address: '75 Grey Street, St Kilda VIC 3182',
    lat: -37.8671,
    lng: 144.9817,
    monthlyMeals: 3000,
    active: true,
  },
];

// Sample delivery history for the current month, calibrated so the three
// starting agencies land in visibly different heatmap intensity bands
// (see lib/calculations.ts). Weights are realistic for hand-delivered
// rescued-food packages (crates/boxes, a handful of kg each).
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function buildEntriesForAgency(
  agencyId: string,
  targetKg: number,
  rand: () => number,
  today: Date,
): DeliveryEntry[] {
  const entries: DeliveryEntry[] = [];
  const daysElapsed = Math.max(1, today.getDate());
  let remaining = targetKg;
  let index = 0;
  while (remaining > 2) {
    const weight = Math.min(remaining, Math.round((6 + rand() * 22) * 10) / 10);
    const day = 1 + Math.floor(rand() * daysElapsed);
    const date = new Date(today.getFullYear(), today.getMonth(), day, 8 + Math.floor(rand() * 9), Math.floor(rand() * 60));
    entries.push({
      id: `${agencyId}-seed-${index}`,
      agencyId,
      weightKg: weight,
      date,
    });
    remaining -= weight;
    index += 1;
    if (index > 60) break; // safety valve
  }
  return entries;
}

export function buildSeedDeliveries(today: Date = new Date()): DeliveryEntry[] {
  const rand = seededRandom(42);
  return [
    // Sacred Heart Mission: high-volume daily dining hall -> ~32% contribution
    ...buildEntriesForAgency('agency-sacred-heart', 960, rand, today),
    // Christ Church Community Centre: smaller, moderate contribution -> ~12%
    ...buildEntriesForAgency('agency-christ-church', 72, rand, today),
    // Uniting Vic.Tas Engagement Hub: just getting started -> ~3%
    ...buildEntriesForAgency('agency-uniting', 45, rand, today),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
}
