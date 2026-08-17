import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { invoicesQuerySchema } from '@/lib/validation/invoice';
import { buildInvoiceWhere, invoiceOrderBy } from '@/lib/services/invoice-query';
import { refreshOverdueInvoices } from '@/lib/services/overdue';
import { formatDate, formatMoney } from '@/lib/format';
import { InvoiceStatusBadge } from '@/components/crm/InvoiceStatusBadge';
import { InvoicesFilterForm } from '@/components/crm/invoices/InvoicesFilterForm';

export const metadata: Metadata = { title: 'Invoices — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

const QUICK_FILTERS = [
  { label: 'All', status: undefined },
  { label: 'Draft', status: 'DRAFT' },
  { label: 'Sent', status: 'SENT' },
  { label: 'Partially Paid', status: 'PARTIALLY_PAID' },
  { label: 'Paid', status: 'PAID' },
  { label: 'Overdue', status: 'OVERDUE' },
] as const;

interface InvoicesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CrmInvoicesPage({ searchParams }: InvoicesPageProps) {
  const rawParams = await searchParams;
  const query = invoicesQuerySchema.parse(rawParams);
  const where = buildInvoiceWhere(query);

  await refreshOverdueInvoices();

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      orderBy: invoiceOrderBy(query.sort),
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function quickFilterHref(status: string | undefined) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.clientName) params.set('clientName', query.clientName);
    if (query.period !== 'all') params.set('period', query.period);
    if (status) params.set('status', status);
    params.set('sort', query.sort);
    return `/crm/invoices?${params.toString()}`;
  }

  function pageHref(page: number) {
    const params = new URLSearchParams();
    if (query.q) params.set('q', query.q);
    if (query.clientName) params.set('clientName', query.clientName);
    if (query.status) params.set('status', query.status);
    if (query.period !== 'all') params.set('period', query.period);
    params.set('sort', query.sort);
    params.set('page', String(page));
    return `/crm/invoices?${params.toString()}`;
  }

  const exportHref = `/api/crm/invoices/export?${new URLSearchParams(
    Object.entries(rawParams).filter(([, v]) => v !== undefined) as [string, string][]
  ).toString()}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="mt-1 text-sm text-slate-400">
            {total} invoice{total === 1 ? '' : 's'} total.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={exportHref}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
          >
            Export CSV
          </a>
          <Link
            href="/crm/invoices/new"
            className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30"
          >
            New Invoice
          </Link>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto rounded-lg border border-white/10 bg-white/[0.03] p-1 text-sm">
        {QUICK_FILTERS.map((filter) => {
          const active = filter.status === query.status || (!filter.status && !query.status);
          return (
            <Link
              key={filter.label}
              href={quickFilterHref(filter.status)}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-medium ${
                active ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <InvoicesFilterForm />

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[950px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Invoice Number</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Issue Date</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Paid</th>
              <th className="px-4 py-3 text-right font-medium">Outstanding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                  No invoices match these filters.
                </td>
              </tr>
            )}
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/crm/invoices/${invoice.id}`} className="font-medium text-white hover:text-sky-300">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-300">{invoice.clientName}</td>
                <td className="px-4 py-3 text-slate-400">{invoice.clientBusinessName ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(invoice.issueDate)}</td>
                <td className="px-4 py-3 text-slate-400">{formatDate(invoice.dueDate)}</td>
                <td className="px-4 py-3">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-4 py-3 text-right text-white">{formatMoney(invoice.totalAmount.toNumber(), invoice.currency)}</td>
                <td className="px-4 py-3 text-right text-emerald-300">{formatMoney(invoice.amountPaid.toNumber(), invoice.currency)}</td>
                <td className="px-4 py-3 text-right text-slate-300">
                  {formatMoney(invoice.amountOutstanding.toNumber(), invoice.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Page {query.page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {query.page > 1 && (
              <Link href={pageHref(query.page - 1)} className="rounded-lg border border-white/10 px-3 py-1.5 hover:border-white/20 hover:text-white">
                Previous
              </Link>
            )}
            {query.page < totalPages && (
              <Link href={pageHref(query.page + 1)} className="rounded-lg border border-white/10 px-3 py-1.5 hover:border-white/20 hover:text-white">
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
