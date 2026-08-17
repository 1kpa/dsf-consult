import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { createInvoiceSchema } from '@/lib/validation/invoice';
import { buildInvoiceWriteData } from '@/lib/services/invoice-write';
import { generateInvoiceNumber, isUniqueConstraintError } from '@/lib/services/invoice-numbering';

export const dynamic = 'force-dynamic';

const MAX_INVOICE_NUMBER_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const { session, error } = await requireSession();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = createInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Please check the invoice and try again.', 400, parsed.error.flatten());
  }
  const input = parsed.data;

  if (input.leadId) {
    const lead = await prisma.lead.findUnique({ where: { id: input.leadId }, select: { id: true } });
    if (!lead) {
      return jsonError('Invalid lead reference', 400);
    }
  }

  const issueDate = new Date(input.issueDate);
  const dueDate = new Date(input.dueDate);
  if (Number.isNaN(issueDate.getTime()) || Number.isNaN(dueDate.getTime())) {
    return jsonError('Invalid issue or due date', 400);
  }

  const { itemsWithTotals, totals } = buildInvoiceWriteData(input);

  for (let attempt = 0; attempt < MAX_INVOICE_NUMBER_ATTEMPTS; attempt++) {
    try {
      const invoice = await prisma.$transaction(async (tx) => {
        const invoiceNumber = await generateInvoiceNumber(tx);

        const created = await tx.invoice.create({
          data: {
            invoiceNumber,
            issueDate,
            dueDate,
            currency: input.currency,
            status: 'DRAFT',
            subtotal: totals.subtotal,
            taxLabel: input.taxLabel || null,
            taxRate: input.taxRate ?? null,
            taxAmount: totals.taxAmount,
            discountType: input.discountType ?? null,
            discountValue: input.discountValue ?? null,
            discountAmount: totals.discountAmount,
            totalAmount: totals.totalAmount,
            amountPaid: 0,
            amountOutstanding: totals.totalAmount,
            notes: input.notes || null,
            clientName: input.clientName,
            clientEmail: input.clientEmail || null,
            clientPhone: input.clientPhone || null,
            clientBusinessName: input.clientBusinessName || null,
            leadId: input.leadId || null,
            createdById: session.sub,
            items: { create: itemsWithTotals },
          },
        });

        if (input.leadId) {
          await tx.leadActivity.create({
            data: {
              leadId: input.leadId,
              userId: session.sub,
              type: 'INVOICE_CREATED',
              message: `Invoice ${invoiceNumber} created (${input.currency} ${totals.totalAmount.toFixed(2)})`,
            },
          });
        }

        return created;
      });

      return jsonSuccess({ invoice: { id: invoice.id, invoiceNumber: invoice.invoiceNumber } }, 201);
    } catch (err) {
      if (isUniqueConstraintError(err) && attempt < MAX_INVOICE_NUMBER_ATTEMPTS - 1) {
        continue; // another request took this number first — retry with the next one
      }
      return jsonError('Unable to create invoice right now.', 500, err);
    }
  }

  return jsonError('Unable to create invoice right now.', 500);
}
