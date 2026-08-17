import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { InvoiceForm } from '@/components/crm/invoices/InvoiceForm';

export const metadata: Metadata = { title: 'New Invoice — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

interface NewInvoicePageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const { leadId } = await searchParams;

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 300,
    select: { id: true, firstName: true, lastName: true, businessName: true, email: true, phone: true },
  });

  if (leadId && !leads.some((lead) => lead.id === leadId)) {
    const specificLead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { id: true, firstName: true, lastName: true, businessName: true, email: true, phone: true },
    });
    if (specificLead) leads.unshift(specificLead);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Invoice</h1>
        <p className="mt-1 text-sm text-slate-400">Create an invoice for an existing lead or a manually entered client.</p>
      </div>
      <InvoiceForm leads={leads} preselectedLeadId={leadId} />
    </div>
  );
}
