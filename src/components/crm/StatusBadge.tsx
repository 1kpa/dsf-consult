import type { LeadStatus } from '@prisma/client';
import { LEAD_STATUS_LABELS } from '@/lib/pipeline';

const STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  CONTACTED: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  QUALIFIED: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
  NURTURE: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  WON: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  LOST: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
