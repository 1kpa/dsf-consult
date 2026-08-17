import type { Prisma } from '@prisma/client';

/**
 * Next sequential invoice number for the given year, formatted DSF-2026-0001.
 * Must be called inside the same transaction that creates the Invoice row —
 * the caller (see /api/crm/invoices route.ts) additionally retries the whole
 * transaction on a unique-constraint conflict, so two concurrent requests
 * can never end up with the same number even though this function itself
 * isn't a hard DB-level sequence.
 */
export async function generateInvoiceNumber(tx: Prisma.TransactionClient, year = new Date().getFullYear()): Promise<string> {
  const prefix = `DSF-${year}-`;

  const existing = await tx.invoice.findMany({
    where: { invoiceNumber: { startsWith: prefix } },
    select: { invoiceNumber: true },
  });

  let maxSeq = 0;
  for (const invoice of existing) {
    const seq = parseInt(invoice.invoiceNumber.slice(prefix.length), 10);
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
}

export function isUniqueConstraintError(error: unknown, target = 'invoiceNumber'): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'P2002' &&
    JSON.stringify((error as { meta?: unknown }).meta ?? '').includes(target)
  );
}
