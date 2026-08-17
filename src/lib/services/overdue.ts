import { prisma } from '@/lib/prisma';

/**
 * There's no background job runner in this app, so overdue status can't be
 * flipped by a scheduled task. Instead, this runs an opportunistic bulk
 * UPDATE whenever finance data is about to be read (dashboard, invoice
 * list/detail) — cheap (single indexed query), idempotent, and keeps the
 * stored `status` column eventually consistent with PHASE 14's rule:
 * dueDate < now AND amountOutstanding > 0 AND status not in (CANCELLED, PAID).
 */
export async function refreshOverdueInvoices(): Promise<void> {
  await prisma.invoice.updateMany({
    where: {
      dueDate: { lt: new Date() },
      amountOutstanding: { gt: 0 },
      status: { notIn: ['CANCELLED', 'PAID', 'OVERDUE'] },
    },
    data: { status: 'OVERDUE' },
  });
}
