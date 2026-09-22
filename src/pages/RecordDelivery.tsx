import { useState, type FormEvent } from 'react';
import { PackagePlus, CheckCircle2, AlertTriangle, Loader2, RotateCcw } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { formatDateTime } from '../lib/date';

type Status = 'idle' | 'saving' | 'error';

export function RecordDelivery() {
  const { activeAgencies, addDelivery } = useData();
  const { showSuccess } = useToast();

  const [agencyId, setAgencyId] = useState('');
  const [weight, setWeight] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<{ agency?: string; weight?: string }>({});
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [lastSaved, setLastSaved] = useState<{ agencyName: string; weight: number; when: Date } | null>(null);

  const weightNum = Number(weight);
  const isValid = Boolean(agencyId) && weight.trim() !== '' && weightNum > 0;

  function validate(): boolean {
    const next: typeof errors = {};
    // BR-07: a valid agency must be selected
    if (!agencyId) next.agency = 'Choose the agency this delivery went to.';
    // BR-06: weight must be a positive number
    if (weight.trim() === '') next.weight = 'Enter the package weight in kilograms.';
    else if (Number.isNaN(weightNum) || weightNum <= 0) next.weight = 'Weight must be a positive number greater than 0.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('saving');
    // Simulated save latency + occasional/forced failure, to exercise the
    // "saving failed, please retry" path required by NFR-03. No backend
    // exists yet in this prototype — a real build persists this to a store.
    await new Promise((r) => setTimeout(r, 600));
    const shouldFail = simulateFailure || Math.random() < 0.05;

    if (shouldFail) {
      setStatus('error');
      return;
    }

    const agency = activeAgencies.find((a) => a.id === agencyId)!;
    const entry = addDelivery({ agencyId, weightKg: weightNum });
    setLastSaved({ agencyName: agency.name, weight: entry.weightKg, when: entry.date });
    setStatus('idle');
    setSimulateFailure(false);
    showSuccess(`Saved: ${entry.weightKg} kg to ${agency.name}.`);
    setWeight('');
    setAgencyId((prev) => prev); // keep agency selected for quick repeat entries
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-emerald-950">
          <PackagePlus className="text-emerald-700" size={24} /> Record a delivery
        </h1>
        <p className="mt-1 text-sm text-emerald-900/60">
          For volunteers dropping off rescued food. Pick the agency, enter the weight, submit — the date and time are
          captured automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-xl border border-emerald-900/10 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="agency" className="text-sm font-medium text-emerald-950">
            Delivery agency
          </label>
          <select
            id="agency"
            value={agencyId}
            onChange={(e) => setAgencyId(e.target.value)}
            className={`rounded-lg border bg-white px-3 py-2.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-600/30 ${
              errors.agency ? 'border-rose-400' : 'border-emerald-900/15'
            }`}
          >
            <option value="">Select an active agency…</option>
            {activeAgencies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.agency && <p className="text-xs font-medium text-rose-600">{errors.agency}</p>}
          {activeAgencies.length === 0 && (
            <p className="text-xs font-medium text-amber-700">
              No active agencies yet — add one on the Manage Agencies screen first.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="weight" className="text-sm font-medium text-emerald-950">
            Package weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.1}
            placeholder="e.g. 12.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className={`rounded-lg border bg-white px-3 py-2.5 text-sm text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-600/30 ${
              errors.weight ? 'border-rose-400' : 'border-emerald-900/15'
            }`}
          />
          {errors.weight && <p className="text-xs font-medium text-rose-600">{errors.weight}</p>}
        </div>

        <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-emerald-900/15 bg-emerald-50/40 px-3 py-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-emerald-900/70">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-emerald-900/30"
            />
            Simulate a save failure (prototype testing aid for NFR-03 — not a real feature)
          </label>
        </div>

        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Your entry couldn't be saved.</p>
              <p className="text-xs text-rose-700/80">Nothing was lost — check your connection and try again.</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!isValid || status === 'saving'}
            className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-900/20"
          >
            {status === 'saving' ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Saving…
              </>
            ) : status === 'error' ? (
              <>
                <RotateCcw size={16} /> Retry submission
              </>
            ) : (
              'Submit delivery'
            )}
          </button>
          <span className="text-xs text-emerald-900/50">Date & time recorded automatically on submit</span>
        </div>
      </form>

      {lastSaved && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <p>
            Last saved: <strong>{lastSaved.weight} kg</strong> to <strong>{lastSaved.agencyName}</strong> at{' '}
            {formatDateTime(lastSaved.when)}.
          </p>
        </div>
      )}
    </div>
  );
}
