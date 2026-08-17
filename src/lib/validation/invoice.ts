import { z } from 'zod';
import { SUPPORTED_CURRENCIES } from '@/lib/settings/invoice';

const PAYMENT_METHODS = ['BANK_TRANSFER', 'CARD', 'CASH', 'CHEQUE', 'E_TRANSFER', 'OTHER'] as const;
const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'] as const;

export const invoiceItemSchema = z.object({
  description: z.string().trim().min(1, 'Description is required').max(500),
  quantity: z.coerce.number().positive('Quantity must be greater than 0').max(1_000_000),
  unitPrice: z.coerce.number().nonnegative('Unit price cannot be negative').max(100_000_000),
});

export const createInvoiceSchema = z.object({
  clientName: z.string().trim().min(1, 'Client name is required').max(200),
  clientBusinessName: z.string().trim().max(200).optional().or(z.literal('')),
  clientEmail: z.string().trim().email('Enter a valid email').max(200).optional().or(z.literal('')),
  clientPhone: z.string().trim().max(50).optional().or(z.literal('')),
  leadId: z.string().trim().min(1).max(100).optional().or(z.literal('')),
  issueDate: z.string().datetime('Enter a valid issue date').or(z.string().min(1)),
  dueDate: z.string().datetime('Enter a valid due date').or(z.string().min(1)),
  currency: z.enum(SUPPORTED_CURRENCIES).default('CAD'),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one line item').max(200),
  taxLabel: z.string().trim().max(50).optional().or(z.literal('')),
  taxRate: z.coerce.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%').optional().nullable(),
  discountType: z.enum(DISCOUNT_TYPES).optional().nullable(),
  discountValue: z.coerce.number().min(0, 'Discount cannot be negative').optional().nullable(),
  notes: z.string().trim().max(5000).optional().or(z.literal('')),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updateInvoiceSchema = createInvoiceSchema.partial();
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive('Payment amount must be greater than 0').max(100_000_000),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(PAYMENT_METHODS, { message: 'Select a payment method' }),
  reference: z.string().trim().max(200).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const invoiceStatusActionSchema = z.object({
  action: z.enum(['MARK_SENT', 'CANCEL', 'RESTORE']),
});

export const invoicesQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  status: z.enum(INVOICE_STATUSES).optional(),
  clientName: z.string().trim().max(200).optional(),
  period: z.enum(['this_month', 'last_month', 'this_quarter', 'last_quarter', 'this_year', 'last_year', 'all', 'custom']).default('all'),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(['newest', 'oldest', 'highest', 'lowest']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
});
export type InvoicesQuery = z.infer<typeof invoicesQuerySchema>;
