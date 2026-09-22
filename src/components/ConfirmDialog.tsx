import { AlertTriangle } from 'lucide-react';

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-emerald-950/40 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-xl border border-emerald-900/10 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-emerald-950">{title}</h3>
            <p className="mt-1 text-sm text-emerald-900/60">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg border border-emerald-900/15 px-3 py-1.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
