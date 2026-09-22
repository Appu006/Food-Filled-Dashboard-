import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Agency, DeliveryEntry } from '../data/types';
import { SEED_AGENCIES, buildSeedDeliveries } from '../data/mockData';

interface DataContextValue {
  agencies: Agency[];
  activeAgencies: Agency[];
  deliveries: DeliveryEntry[];
  addAgency: (input: { name: string; address: string; lat: number; lng: number; monthlyMeals: number }) => Agency;
  updateAgency: (
    id: string,
    input: { name: string; address: string; lat: number; lng: number; monthlyMeals: number },
  ) => void;
  removeAgency: (id: string) => void;
  addDelivery: (input: { agencyId: string; weightKg: number }) => DeliveryEntry;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [agencies, setAgencies] = useState<Agency[]>(() =>
    SEED_AGENCIES.map((a) => ({ ...a, createdAt: new Date() })),
  );
  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>(() => buildSeedDeliveries());

  const addAgency: DataContextValue['addAgency'] = useCallback((input) => {
    const agency: Agency = {
      id: `agency-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      name: input.name.trim(),
      address: input.address.trim(),
      lat: input.lat,
      lng: input.lng,
      monthlyMeals: input.monthlyMeals,
      active: true,
      createdAt: new Date(),
    };
    setAgencies((prev) => [...prev, agency]);
    return agency;
  }, []);

  const updateAgency: DataContextValue['updateAgency'] = useCallback((id, input) => {
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              name: input.name.trim(),
              address: input.address.trim(),
              lat: input.lat,
              lng: input.lng,
              monthlyMeals: input.monthlyMeals,
            }
          : a,
      ),
    );
  }, []);

  // BR-12: removing an agency deletes its past delivery entries too.
  const removeAgency: DataContextValue['removeAgency'] = useCallback((id) => {
    setAgencies((prev) => prev.filter((a) => a.id !== id));
    setDeliveries((prev) => prev.filter((d) => d.agencyId !== id));
  }, []);

  const addDelivery: DataContextValue['addDelivery'] = useCallback((input) => {
    const entry: DeliveryEntry = {
      id: `delivery-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      agencyId: input.agencyId,
      weightKg: input.weightKg,
      date: new Date(), // FR-03: captured automatically
    };
    setDeliveries((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const activeAgencies = useMemo(() => agencies.filter((a) => a.active), [agencies]);

  const value = useMemo(
    () => ({ agencies, activeAgencies, deliveries, addAgency, updateAgency, removeAgency, addDelivery }),
    [agencies, activeAgencies, deliveries, addAgency, updateAgency, removeAgency, addDelivery],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
