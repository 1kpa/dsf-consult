import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { generateInvoiceNumber, isUniqueConstraintError } from '@/lib/services/invoice-numbering';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MAX_ATTEMPTS = 5;

export async function POST(_request: Request, { params }: RouteParams) {
  const { session, error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  const source = await prisma.invoice.findUnique({ where: { id }, include: { items: true } });
  if (!source) {
    return jsonError('Invoice not found', 404);
  }

  const dueOffsetMs = source.dueDate.getTime() - source.issueDate.getTime();
  const issueDate = new Date();
  const dueDate = new Date(issueDate.getTime() + Math.max(dueOffsetMs, 0));

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const invoice = await prisma.$transaction(async (tx) => {
        const invoiceNumber = await generateInvoiceNumber(tx);
        return tx.invoice.create({
          data: {
            invoiceNumber,
            issueDate,
            dueDate,
            currency: source.currency,
            status: 'DRAFT',
            subtotal: source.subtotal,
            taxLabel: source.taxLabel,
            taxRate: source.taxRate,
            taxAmount: source.taxAmount,
            discountType: source.discountType,
            discountValue: source.discountValue,
            discountAmount: source.discountAmount,
            totalAmount: source.totalAmount,
            amountPaid: 0,
            amountOutstanding: source.totalAmount,
            notes: source.notes,
            clientName: source.clientName,
            clientEmail: source.clientEmail,
            clientPhone: source.clientPhone,
            clientBusinessName: source.clientBusinessName,
            leadId: source.leadId,
            businessId: source.businessId,
            createdById: session.sub,
            items: {
              create: source.items.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
                sortOrder: item.sortOrder,
              })),
            },
          },
        });
      });

      return jsonSuccess({ invoice: { id: invoice.id, invoiceNumber: invoice.invoiceNumber } }, 201);
    } catch (err) {
      if (isUniqueConstraintError(err) && attempt < MAX_ATTEMPTS - 1) continue;
      return jsonError('Unable to duplicate invoice right now.', 500, err);
    }
  }

  return jsonError('Unable to duplicate invoice right now.', 500);
}
