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
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-emerald-950">
            <Building2 className="text-emerald-700" size={24} /> Manage agencies
          </h1>
          <p className="mt-1 text-sm text-emerald-900/60">
            Add, edit or remove the partner agencies volunteers can deliver to. Changes appear immediately in the
            delivery form and the heatmap.
          </p>
        </div>
        <button
          onClick={() => setEditing('new')}
          className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          <Plus size={16} /> Add agency
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-emerald-900/10 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50/60 text-xs uppercase tracking-wide text-emerald-900/60">
            <tr>
              <th className="px-4 py-3 font-medium">Agency</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Est. monthly output</th>
              <th className="px-4 py-3 font-medium">This month</th>
              <th className="px-4 py-3 font-medium">Added</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/5">
            {agencies.map((agency) => {
              const deliveredKg = deliveredKgThisMonth(agency.id, deliveries);
              const outputKg = agencyMonthlyOutputKg(agency);
              return (
                <tr key={agency.id} className="hover:bg-emerald-50/30">
                  <td className="px-4 py-3 font-medium text-emerald-950">{agency.name}</td>
                  <td className="px-4 py-3 text-emerald-900/70">
                    <span className="flex items-center gap-1.5">
                      <MapPinned size={13} className="shrink-0 text-emerald-700/60" />
                      {agency.address}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-emerald-900/70">
                    {agency.monthlyMeals.toLocaleString()} meals
                    <span className="block text-xs text-emerald-900/40">≈ {outputKg.toFixed(0)} kg</span>
                  </td>
                  <td className="px-4 py-3 text-emerald-900/70">{deliveredKg.toFixed(1)} kg delivered</td>
                  <td className="px-4 py-3 text-emerald-900/50">{formatDate(agency.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditing(agency)}
                        className="flex items-center gap-1 rounded-md border border-emerald-900/15 px-2.5 py-1.5 text-xs font-medium text-emerald-900 hover:bg-emerald-50"
                      >
                        <Pencil size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setPendingDelete(agency)}
                        className="flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
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
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-emerald-900/50">
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
