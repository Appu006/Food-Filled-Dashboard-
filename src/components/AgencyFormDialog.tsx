import { useState, type FormEvent } from 'react';
import { Loader2, MapPin, X } from 'lucide-react';
import type { Agency } from '../data/types';
import { mockGeocodeAddress } from '../lib/geocode';

export interface AgencyFormValues {
  name: string;
  address: string;
  monthlyMeals: string;
}

export function AgencyFormDialog({
  agency,
  onCancel,
  onSave,
}: {
  agency: Agency | null; // null = adding a new agency
  onCancel: () => void;
  onSave: (input: { name: string; address: string; lat: number; lng: number; monthlyMeals: number }) => void;
}) {
  const [values, setValues] = useState<AgencyFormValues>({
    name: agency?.name ?? '',
    address: agency?.address ?? '',
    monthlyMeals: agency ? String(agency.monthlyMeals) : '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof AgencyFormValues, string>>>({});
  const [geoStatus, setGeoStatus] = useState<'idle' | 'locating' | 'error'>('idle');

  function validateFields(): boolean {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = 'Agency name is required.';
    if (!values.address.trim()) next.address = 'Street address is required.';
    const meals = Number(values.monthlyMeals);
    if (values.monthlyMeals.trim() === '' || Number.isNaN(meals) || meals <= 0) {
      next.monthlyMeals = 'Enter a positive number of meals per month.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateFields()) return;

    setGeoStatus('locating');
    // FR-07 / US-05: address -> map location, without the admin providing coordinates.
    const result = await mockGeocodeAddress(values.address);

    if (!result) {
      // BR-08: cannot save unless the address resolves to a location.
      setGeoStatus('error');
      return;
    }

    setGeoStatus('idle');
    onSave({
      name: values.name.trim(),
      address: values.address.trim(),
      lat: result.lat,
      lng: result.lng,
      monthlyMeals: Number(values.monthlyMeals),
    });
  }

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-brand-navy/50 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-2xl border-2 border-brand-ink bg-white p-6 shadow-[4px_4px_0_#111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-brand-navy">{agency ? 'Edit agency' : 'Add new agency'}</h3>
            <p className="text-xs font-medium text-brand-navy/50">Used in the delivery dropdown and the impact heatmap.</p>
          </div>
          <button onClick={onCancel} className="text-brand-navy/40 hover:text-brand-navy" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-brand-navy">Agency name</label>
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="e.g. Sacred Heart Mission Dining Hall"
              className={`rounded-xl border-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 ${
                errors.name ? 'border-rose-500' : 'border-brand-ink/30'
              }`}
            />
            {errors.name && <p className="text-xs font-bold text-rose-600">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-brand-navy">Street address</label>
            <input
              value={values.address}
              onChange={(e) => {
                setValues((v) => ({ ...v, address: e.target.value }));
                if (geoStatus === 'error') setGeoStatus('idle');
              }}
              placeholder="e.g. 87 Grey Street, St Kilda VIC 3182"
              className={`rounded-xl border-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 ${
                errors.address || geoStatus === 'error' ? 'border-rose-500' : 'border-brand-ink/30'
              }`}
            />
            {errors.address && <p className="text-xs font-bold text-rose-600">{errors.address}</p>}
            {geoStatus === 'error' && !errors.address && (
              <p className="text-xs font-bold text-rose-600">
                We couldn't recognise this address. Try including a suburb, e.g. "…, St Kilda VIC" or "…, Geelong VIC".
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-brand-navy/45">
              <MapPin size={12} /> The map location is determined automatically from this address — no coordinates needed.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-brand-navy">Estimated monthly output (meals)</label>
            <input
              type="number"
              min={0}
              value={values.monthlyMeals}
              onChange={(e) => setValues((v) => ({ ...v, monthlyMeals: e.target.value }))}
              placeholder="e.g. 3000"
              className={`rounded-xl border-2 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 ${
                errors.monthlyMeals ? 'border-rose-500' : 'border-brand-ink/30'
              }`}
            />
            {errors.monthlyMeals && <p className="text-xs font-bold text-rose-600">{errors.monthlyMeals}</p>}
            <p className="text-xs text-brand-navy/45">Based on the NFP's own research. Converted at 1 meal = 0.5kg (BR-01).</p>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border-2 border-brand-ink px-3.5 py-2 text-sm font-bold text-brand-navy hover:bg-brand-lavender/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={geoStatus === 'locating'}
              className="flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-orange px-4 py-2 text-sm font-bold text-white shadow-[2px_2px_0_#111] hover:bg-brand-orange-dark disabled:opacity-60"
            >
              {geoStatus === 'locating' ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Locating address…
                </>
              ) : agency ? (
                'Save changes'
              ) : (
                'Add agency'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
