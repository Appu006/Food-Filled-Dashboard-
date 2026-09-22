import type { Agency, DeliveryEntry } from '../data/types';
import { isSameMonth } from './date';

// BR-01: 1 meal = 0.5kg
export const KG_PER_MEAL = 0.5;

// BR-03: fixed 5km impact radius, not configurable per agency
export const IMPACT_RADIUS_KM = 5;

export function agencyMonthlyOutputKg(agency: Agency): number {
  return agency.monthlyMeals * KG_PER_MEAL;
}

// BR-02: only entries within the current calendar month count
export function deliveredKgThisMonth(
  agencyId: string,
  entries: DeliveryEntry[],
  now: Date = new Date(),
): number {
  return entries
    .filter((e) => e.agencyId === agencyId && isSameMonth(e.date, now))
    .reduce((sum, e) => sum + e.weightKg, 0);
}

// BR-05: contribution % = NFP kg delivered this month / agency's estimated monthly kg output
export function contributionPct(agency: Agency, entries: DeliveryEntry[], now: Date = new Date()): number {
  const output = agencyMonthlyOutputKg(agency);
  if (output <= 0) return 0;
  const delivered = deliveredKgThisMonth(agency.id, entries, now);
  return delivered / output;
}

export interface AgencyImpact {
  agency: Agency;
  deliveredKg: number;
  outputKg: number;
  contribution: number; // 0..1+ (can exceed 1 if over-delivered; UI clamps for color)
  entryCount: number;
}

export function computeAgencyImpacts(
  agencies: Agency[],
  entries: DeliveryEntry[],
  now: Date = new Date(),
): AgencyImpact[] {
  return agencies.map((agency) => {
    const deliveredKg = deliveredKgThisMonth(agency.id, entries, now);
    const outputKg = agencyMonthlyOutputKg(agency);
    return {
      agency,
      deliveredKg,
      outputKg,
      contribution: outputKg > 0 ? deliveredKg / outputKg : 0,
      entryCount: entries.filter((e) => e.agencyId === agency.id && isSameMonth(e.date, now)).length,
    };
  });
}

export function impactBand(contribution: number): {
  label: string;
  stop: number;
} {
  const pct = Math.min(contribution, 1);
  if (pct <= 0) return { label: 'No activity yet', stop: 0 };
  if (pct < 0.1) return { label: 'Low impact', stop: pct };
  if (pct < 0.25) return { label: 'Moderate impact', stop: pct };
  if (pct < 0.5) return { label: 'High impact', stop: pct };
  return { label: 'Very high impact', stop: pct };
}
