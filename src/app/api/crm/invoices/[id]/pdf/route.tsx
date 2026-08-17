import { renderToBuffer } from '@react-pdf/renderer';
import { prisma } from '@/lib/prisma';
import { jsonError } from '@/lib/api-response';
import { requireSession } from '@/lib/auth/guard';
import { serializeInvoice } from '@/lib/services/invoice-serialize';
import { InvoicePdfDocument } from '@/lib/pdf/InvoicePdfDocument';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { error } = await requireSession();
  if (error) return error;

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { items: true, payments: { orderBy: { paymentDate: 'asc' } } },
  });
  if (!invoice) {
    return jsonError('Invoice not found', 404);
  }

  try {
    const serialized = serializeInvoice(invoice);
    const buffer = await renderToBuffer(<InvoicePdfDocument invoice={serialized} />);

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    return jsonError('Unable to generate PDF right now.', 500, err);
  }
}
