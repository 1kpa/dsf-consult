import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { invoiceStatusActionSchema } from '@/lib/validation/invoice';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = invoiceStatusActionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Invalid action', 400);
  }

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice) {
    return jsonError('Invoice not found', 404);
  }

  const { action } = parsed.data;

  if (action === 'MARK_SENT') {
    if (invoice.status !== 'DRAFT') {
      return jsonError('Only draft invoices can be marked as sent', 400);
    }
    await prisma.invoice.update({ where: { id }, data: { status: 'SENT' } });
  } else if (action === 'CANCEL') {
    if (invoice.status === 'CANCELLED') {
      return jsonError('Invoice is already cancelled', 400);
    }
    await prisma.invoice.update({ where: { id }, data: { status: 'CANCELLED' } });
  } else if (action === 'RESTORE') {
    if (invoice.status !== 'CANCELLED') {
      return jsonError('Only cancelled invoices can be restored', 400);
    }
    await prisma.invoice.update({ where: { id }, data: { status: 'DRAFT' } });
  }

  if (invoice.leadId) {
    const messages: Record<string, string> = {
      MARK_SENT: `Invoice ${invoice.invoiceNumber} marked as sent`,
      CANCEL: `Invoice ${invoice.invoiceNumber} cancelled`,
      RESTORE: `Invoice ${invoice.invoiceNumber} restored to draft`,
    };
    await prisma.leadActivity.create({
      data: { leadId: invoice.leadId, userId: session.sub, type: 'INVOICE_CREATED', message: messages[action] },
    });
  }

  return jsonSuccess({ invoice: { id } });
}
