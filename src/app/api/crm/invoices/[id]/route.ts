import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { createInvoiceSchema } from '@/lib/validation/invoice';
import { buildInvoiceWriteData } from '@/lib/services/invoice-write';
import { computeInvoiceStatus, roundMoney } from '@/lib/services/invoice-calc';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return jsonError('Invoice not found', 404);
  }
  if (invoice.status === 'CANCELLED') {
    return jsonError('This invoice is cancelled. Restore it before editing.', 400);
  }

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
  const amountPaid = invoice.amountPaid.toNumber();
  const amountOutstanding = roundMoney(totals.totalAmount - amountPaid);

  const nextStatus = computeInvoiceStatus({
    totalAmount: totals.totalAmount,
    amountPaid,
    dueDate,
    currentStatus: invoice.status,
  });

  try {
    await prisma.$transaction(async (tx) => {
      await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await tx.invoice.update({
        where: { id },
        data: {
          issueDate,
          dueDate,
          currency: input.currency,
          status: nextStatus,
          subtotal: totals.subtotal,
          taxLabel: input.taxLabel || null,
          taxRate: input.taxRate ?? null,
          taxAmount: totals.taxAmount,
          discountType: input.discountType ?? null,
          discountValue: input.discountValue ?? null,
          discountAmount: totals.discountAmount,
          totalAmount: totals.totalAmount,
          amountOutstanding,
          notes: input.notes || null,
          clientName: input.clientName,
          clientEmail: input.clientEmail || null,
          clientPhone: input.clientPhone || null,
          clientBusinessName: input.clientBusinessName || null,
          leadId: input.leadId || null,
          items: { create: itemsWithTotals },
        },
      });
    });

    return jsonSuccess({ invoice: { id } });
  } catch (err) {
    return jsonError('Unable to update invoice right now.', 500, err);
  }
}
