import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { recordPaymentSchema } from '@/lib/validation/invoice';
import { computeInvoiceStatus, roundMoney } from '@/lib/services/invoice-calc';
import { formatMoney } from '@/lib/format';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return jsonError('Invoice not found', 404);
  }
  if (invoice.status === 'CANCELLED') {
    return jsonError('Cannot record a payment against a cancelled invoice', 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = recordPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Please check the payment and try again.', 400);
  }
  const input = parsed.data;

  const paymentDate = new Date(input.paymentDate);
  if (Number.isNaN(paymentDate.getTime())) {
    return jsonError('Invalid payment date', 400);
  }

  const outstanding = invoice.amountOutstanding.toNumber();
  if (input.amount > outstanding) {
    return jsonError(
      `Payment of ${formatMoney(input.amount, invoice.currency)} exceeds the outstanding balance of ${formatMoney(outstanding, invoice.currency)}. Overpayments are not supported.`,
      400
    );
  }

  const newAmountPaid = roundMoney(invoice.amountPaid.toNumber() + input.amount);
  const newOutstanding = roundMoney(invoice.totalAmount.toNumber() - newAmountPaid);
  const nextStatus = computeInvoiceStatus({
    totalAmount: invoice.totalAmount.toNumber(),
    amountPaid: newAmountPaid,
    dueDate: invoice.dueDate,
    currentStatus: invoice.status,
  });

  try {
    const payment = await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          invoiceId: id,
          amount: input.amount,
          paymentDate,
          paymentMethod: input.paymentMethod,
          reference: input.reference || null,
          notes: input.notes || null,
          createdById: session.sub,
        },
      });

      await tx.invoice.update({
        where: { id },
        data: {
          amountPaid: newAmountPaid,
          amountOutstanding: newOutstanding,
          status: nextStatus,
          paidAt: nextStatus === 'PAID' ? paymentDate : invoice.paidAt,
        },
      });

      if (invoice.leadId) {
        await tx.leadActivity.create({
          data: {
            leadId: invoice.leadId,
            userId: session.sub,
            type: 'PAYMENT_RECORDED',
            message: `Payment of ${formatMoney(input.amount, invoice.currency)} recorded on invoice ${invoice.invoiceNumber}`,
          },
        });
      }

      return createdPayment;
    });

    return jsonSuccess({ payment: { id: payment.id } }, 201);
  } catch (err) {
    return jsonError('Unable to record payment right now.', 500, err);
  }
}
