import type { Invoice, InvoiceItem, Payment } from '@prisma/client';

/**
 * Prisma's Decimal fields are decimal.js instances server-side — neither
 * `NextResponse.json()` nor passing props from a Server Component to a
 * Client Component handles them the way you'd expect (decimal.js serializes
 * itself to a *string*, not a number). Every Decimal field is converted to
 * a plain `number` here, once, at the boundary.
 */

export function serializeInvoiceItem(item: InvoiceItem) {
  return {
    id: item.id,
    invoiceId: item.invoiceId,
    description: item.description,
    quantity: item.quantity.toNumber(),
    unitPrice: item.unitPrice.toNumber(),
    lineTotal: item.lineTotal.toNumber(),
    sortOrder: item.sortOrder,
  };
}

export function serializePayment(payment: Payment) {
  return {
    id: payment.id,
    invoiceId: payment.invoiceId,
    amount: payment.amount.toNumber(),
    paymentDate: payment.paymentDate.toISOString(),
    paymentMethod: payment.paymentMethod,
    reference: payment.reference,
    notes: payment.notes,
    createdById: payment.createdById,
    createdAt: payment.createdAt.toISOString(),
  };
}

type InvoiceWithRelations = Invoice & {
  items?: InvoiceItem[];
  payments?: Payment[];
};

export function serializeInvoice(invoice: InvoiceWithRelations) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    status: invoice.status,
    currency: invoice.currency,
    subtotal: invoice.subtotal.toNumber(),
    taxLabel: invoice.taxLabel,
    taxRate: invoice.taxRate ? invoice.taxRate.toNumber() : null,
    taxAmount: invoice.taxAmount.toNumber(),
    discountType: invoice.discountType,
    discountValue: invoice.discountValue ? invoice.discountValue.toNumber() : null,
    discountAmount: invoice.discountAmount.toNumber(),
    totalAmount: invoice.totalAmount.toNumber(),
    amountPaid: invoice.amountPaid.toNumber(),
    amountOutstanding: invoice.amountOutstanding.toNumber(),
    notes: invoice.notes,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    clientPhone: invoice.clientPhone,
    clientBusinessName: invoice.clientBusinessName,
    leadId: invoice.leadId,
    businessId: invoice.businessId,
    createdById: invoice.createdById,
    paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
    items: invoice.items ? invoice.items.sort((a, b) => a.sortOrder - b.sortOrder).map(serializeInvoiceItem) : undefined,
    payments: invoice.payments ? invoice.payments.map(serializePayment) : undefined,
  };
}

export type SerializedInvoice = ReturnType<typeof serializeInvoice>;
