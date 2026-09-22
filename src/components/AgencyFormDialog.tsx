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
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-emerald-950/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-xl border border-emerald-900/10 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-emerald-950">{agency ? 'Edit agency' : 'Add new agency'}</h3>
            <p className="text-xs text-emerald-900/50">Used in the delivery dropdown and the impact heatmap.</p>
          </div>
          <button onClick={onCancel} className="text-emerald-900/40 hover:text-emerald-900" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emerald-950">Agency name</label>
            <input
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              placeholder="e.g. Sacred Heart Mission Dining Hall"
              className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                errors.name ? 'border-rose-400' : 'border-emerald-900/15'
              }`}
            />
            {errors.name && <p className="text-xs font-medium text-rose-600">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emerald-950">Street address</label>
            <input
              value={values.address}
              onChange={(e) => {
                setValues((v) => ({ ...v, address: e.target.value }));
                if (geoStatus === 'error') setGeoStatus('idle');
              }}
              placeholder="e.g. 87 Grey Street, St Kilda VIC 3182"
              className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                errors.address || geoStatus === 'error' ? 'border-rose-400' : 'border-emerald-900/15'
              }`}
            />
            {errors.address && <p className="text-xs font-medium text-rose-600">{errors.address}</p>}
            {geoStatus === 'error' && !errors.address && (
              <p className="text-xs font-medium text-rose-600">
                We couldn't recognise this address. Try including a suburb, e.g. "…, St Kilda VIC" or "…, Geelong VIC".
              </p>
            )}
            <p className="flex items-center gap-1 text-xs text-emerald-900/45">
              <MapPin size={12} /> The map location is determined automatically from this address — no coordinates needed.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-emerald-950">Estimated monthly output (meals)</label>
            <input
              type="number"
              min={0}
              value={values.monthlyMeals}
              onChange={(e) => setValues((v) => ({ ...v, monthlyMeals: e.target.value }))}
              placeholder="e.g. 3000"
              className={`rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-600/30 ${
                errors.monthlyMeals ? 'border-rose-400' : 'border-emerald-900/15'
              }`}
            />
            {errors.monthlyMeals && <p className="text-xs font-medium text-rose-600">{errors.monthlyMeals}</p>}
            <p className="text-xs text-emerald-900/45">Based on the NFP's own research. Converted at 1 meal = 0.5kg (BR-01).</p>
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-emerald-900/15 px-3 py-2 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={geoStatus === 'locating'}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
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
