import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { InvoiceForm } from '@/components/crm/invoices/InvoiceForm';

export const metadata: Metadata = { title: 'Edit Invoice — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;

  const [invoice, leads] = await Promise.all([
    prisma.invoice.findUnique({ where: { id }, include: { items: { orderBy: { sortOrder: 'asc' } } } }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 300,
      select: { id: true, firstName: true, lastName: true, businessName: true, email: true, phone: true },
    }),
  ]);

  if (!invoice) {
    notFound();
  }
  if (invoice.status === 'CANCELLED') {
    redirect(`/crm/invoices/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Edit Invoice {invoice.invoiceNumber}</h1>
        <p className="mt-1 text-sm text-slate-400">Totals are recalculated automatically when you save.</p>
      </div>
      <InvoiceForm
        leads={leads}
        mode="edit"
        invoiceId={invoice.id}
        initialValues={{
          leadId: invoice.leadId ?? undefined,
          clientName: invoice.clientName,
          clientBusinessName: invoice.clientBusinessName ?? '',
          clientEmail: invoice.clientEmail ?? '',
          clientPhone: invoice.clientPhone ?? '',
          issueDate: invoice.issueDate.toISOString().slice(0, 10),
          dueDate: invoice.dueDate.toISOString().slice(0, 10),
          currency: invoice.currency,
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
          })),
          taxLabel: invoice.taxLabel ?? '',
          taxRate: invoice.taxRate ? invoice.taxRate.toString() : '',
          discountType: invoice.discountType ?? '',
          discountValue: invoice.discountValue ? invoice.discountValue.toString() : '',
          notes: invoice.notes ?? '',
        }}
      />
    </div>
  );
}
