/**
 * Pure invoice math, used on both the client (live preview while building an
 * invoice) and the server (authoritative recalculation before every save —
 * see PHASE 18: never trust client-submitted totals). Money is handled as
 * plain JS numbers rounded to the cent at each step; the database stores it
 * as Postgres NUMERIC via Prisma's Decimal fields, so precision is never
 * lost at rest even though arithmetic here is done with plain numbers.
 */

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export interface InvoiceItemInput {
  quantity: number;
  unitPrice: number;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

export type DiscountType = 'PERCENTAGE' | 'FIXED';

export interface InvoiceTotalsInput {
  items: InvoiceItemInput[];
  taxRate?: number | null;
  discountType?: DiscountType | null;
  discountValue?: number | null;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateInvoiceTotals({ items, taxRate, discountType, discountValue }: InvoiceTotalsInput): InvoiceTotals {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice), 0));

  let discountAmount = 0;
  if (discountType && discountValue && discountValue > 0) {
    discountAmount =
      discountType === 'PERCENTAGE' ? roundMoney((subtotal * discountValue) / 100) : roundMoney(discountValue);
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxRate ? roundMoney((taxableAmount * taxRate) / 100) : 0;

  const totalAmount = roundMoney(taxableAmount + taxAmount);

  return { subtotal, discountAmount, taxAmount, totalAmount };
}

export type ComputableInvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';

interface StatusInput {
  totalAmount: number;
  amountPaid: number;
  dueDate: Date;
  currentStatus: ComputableInvoiceStatus;
  now?: Date;
}

/**
 * Derives the correct status after a payment (or on read, for overdue
 * detection) — see PHASE 9 / PHASE 14. DRAFT and CANCELLED are never
 * auto-overridden by payment/due-date logic; everything else is.
 */
export function computeInvoiceStatus({ totalAmount, amountPaid, dueDate, currentStatus, now = new Date() }: StatusInput): ComputableInvoiceStatus {
  if (currentStatus === 'CANCELLED' || currentStatus === 'DRAFT') return currentStatus;

  const outstanding = roundMoney(totalAmount - amountPaid);

  if (outstanding <= 0) return 'PAID';
  if (amountPaid > 0) {
    if (dueDate.getTime() < now.getTime()) return 'OVERDUE';
    return 'PARTIALLY_PAID';
  }
  if (dueDate.getTime() < now.getTime()) return 'OVERDUE';
  return currentStatus === 'OVERDUE' ? 'SENT' : currentStatus;
}

export function isInvoiceOverdue(params: { dueDate: Date; amountOutstanding: number; status: ComputableInvoiceStatus; now?: Date }): boolean {
  const { dueDate, amountOutstanding, status, now = new Date() } = params;
  if (status === 'CANCELLED' || status === 'PAID') return false;
  return dueDate.getTime() < now.getTime() && amountOutstanding > 0;
}
