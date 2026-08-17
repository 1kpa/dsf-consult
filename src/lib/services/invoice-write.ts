import type { CreateInvoiceInput } from '@/lib/validation/invoice';
import { calculateInvoiceTotals, calculateLineTotal } from '@/lib/services/invoice-calc';

/**
 * Turns validated invoice input into the exact numbers/rows that get
 * written to the database — the single place totals are computed
 * server-side, so a client can never submit a pre-calculated total that
 * doesn't match its line items (PHASE 18).
 */
export function buildInvoiceWriteData(input: CreateInvoiceInput) {
  const itemsWithTotals = input.items.map((item, index) => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: calculateLineTotal(item.quantity, item.unitPrice),
    sortOrder: index,
  }));

  const totals = calculateInvoiceTotals({
    items: input.items,
    taxRate: input.taxRate ?? undefined,
    discountType: input.discountType ?? undefined,
    discountValue: input.discountValue ?? undefined,
  });

  return { itemsWithTotals, totals };
}
