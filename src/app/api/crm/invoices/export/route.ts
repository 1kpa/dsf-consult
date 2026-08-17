import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { invoicesQuerySchema } from '@/lib/validation/invoice';
import { buildInvoiceWhere, invoiceOrderBy } from '@/lib/services/invoice-query';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

function csvEscape(value: string | number): string {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const HEADERS = [
  'Invoice Number',
  'Client',
  'Business',
  'Issue Date',
  'Due Date',
  'Status',
  'Currency',
  'Subtotal',
  'Tax',
  'Discount',
  'Total',
  'Paid',
  'Outstanding',
];

export async function GET(request: NextRequest) {
  const { error } = await requireSession();
  if (error) return error;

  const query = invoicesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const where = buildInvoiceWhere(query);

  try {
    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: invoiceOrderBy(query.sort),
      take: 5000,
    });

    const rows = invoices.map((invoice) =>
      [
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.clientBusinessName || '',
        formatDate(invoice.issueDate),
        formatDate(invoice.dueDate),
        invoice.status,
        invoice.currency,
        invoice.subtotal.toFixed(2),
        invoice.taxAmount.toFixed(2),
        invoice.discountAmount.toFixed(2),
        invoice.totalAmount.toFixed(2),
        invoice.amountPaid.toFixed(2),
        invoice.amountOutstanding.toFixed(2),
      ]
        .map(csvEscape)
        .join(',')
    );

    const csv = [HEADERS.join(','), ...rows].join('\r\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="invoices-${new Date().toISOString().slice(0, 10)}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return jsonError('Unable to export invoices right now.', 500, err);
  }
}
