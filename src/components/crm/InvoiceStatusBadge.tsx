const STATUS_STYLES: Record<string, string> = {
  DRAFT: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  SENT: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  PARTIALLY_PAID: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  PAID: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  OVERDUE: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
  CANCELLED: 'bg-slate-700/30 text-slate-500 border-slate-600/30',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PARTIALLY_PAID: 'Partially Paid',
  PAID: 'Paid',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.DRAFT;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${style}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
