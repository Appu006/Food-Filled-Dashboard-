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
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-brand-navy/50 px-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-brand-ink bg-white p-5 shadow-[4px_4px_0_#111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand-ink bg-rose-100 text-rose-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h3 className="font-display text-sm font-semibold text-brand-navy">{title}</h3>
            <p className="mt-1 text-sm text-brand-navy/60">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border-2 border-brand-ink px-3.5 py-1.5 text-sm font-bold text-brand-navy hover:bg-brand-lavender/50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full border-2 border-brand-ink bg-rose-600 px-3.5 py-1.5 text-sm font-bold text-white shadow-[2px_2px_0_#111] hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
