import { useState } from 'react';
import { Building2, Plus, Pencil, Trash2, MapPinned } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useToast } from '../components/Toast';
import { AgencyFormDialog } from '../components/AgencyFormDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import type { Agency } from '../data/types';
import { agencyMonthlyOutputKg, deliveredKgThisMonth } from '../lib/calculations';
import { formatDate } from '../lib/date';

export function ManageAgencies() {
  const { agencies, deliveries, addAgency, updateAgency, removeAgency } = useData();
  const { showSuccess } = useToast();

  const [editing, setEditing] = useState<Agency | null | 'new'>(null);
  const [pendingDelete, setPendingDelete] = useState<Agency | null>(null);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-semibold text-brand-navy">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-brand-ink bg-brand-purple text-white">
              <Building2 size={18} />
            </span>
            Manage agencies
          </h1>
          <p className="mt-1 text-sm font-medium text-brand-navy/60">
            Add, edit or remove the partner agencies volunteers can deliver to. Changes appear immediately in the
            delivery form and the heatmap.
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-full border-2 border-brand-ink bg-brand-orange px-4 py-2.5 text-sm font-bold text-white shadow-[2px_2px_0_#111] hover:bg-brand-orange-dark"
        >
          <Plus size={16} /> Add agency
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-brand-ink bg-white shadow-[3px_3px_0_#111]">
        <table className="w-full text-left text-sm">
          <thead className="border-b-2 border-brand-ink bg-brand-lavender/50 text-xs uppercase tracking-wide text-brand-navy/70">
            <tr>
              <th className="px-4 py-3 font-bold">Agency</th>
              <th className="px-4 py-3 font-bold">Address</th>
              <th className="px-4 py-3 font-bold">Est. monthly output</th>
              <th className="px-4 py-3 font-bold">This month</th>
              <th className="px-4 py-3 font-bold">Added</th>
              <th className="px-4 py-3 text-right font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-ink/10">
            {agencies.map((agency) => {
              const deliveredKg = deliveredKgThisMonth(agency.id, deliveries);
              const outputKg = agencyMonthlyOutputKg(agency);
              return (
                <tr key={agency.id} className="hover:bg-brand-lavender/20">
                  <td className="px-4 py-3 font-semibold text-brand-navy">{agency.name}</td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    <span className="flex items-center gap-1.5">
                      <MapPinned size={13} className="shrink-0 text-brand-orange" />
                      {agency.address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">
                    {agency.monthlyMeals.toLocaleString()} meals
                    <span className="block text-xs text-brand-navy/40">≈ {outputKg.toFixed(0)} kg</span>
                  </td>
                  <td className="px-4 py-3 text-brand-navy/70">{deliveredKg.toFixed(1)} kg delivered</td>
                  <td className="px-4 py-3 text-brand-navy/50">{formatDate(agency.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(agency)}
                        className="flex items-center gap-1 rounded-full border-2 border-brand-ink px-2.5 py-1.5 text-xs font-bold text-brand-navy hover:bg-brand-lavender/50"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete(agency)}
                        className="flex items-center gap-1 rounded-full border-2 border-rose-400 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {agencies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-brand-navy/50">
                  No agencies yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <AgencyFormDialog
          agency={editing === 'new' ? null : editing}
          onCancel={() => setEditing(null)}
          onSave={(input) => {
            if (editing === 'new') {
              addAgency(input);
              showSuccess(`${input.name} added to the agency list.`);
            } else {
              updateAgency(editing.id, input);
              showSuccess(`${input.name} updated.`);
            }
            setEditing(null);
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Remove ${pendingDelete.name}?`}
          description="This removes the agency from the delivery dropdown and the heatmap. Its delivery history for this month will be deleted too (BR-12) and can't be undone."
          confirmLabel="Remove agency"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            removeAgency(pendingDelete.id);
            showSuccess(`${pendingDelete.name} removed.`);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}
