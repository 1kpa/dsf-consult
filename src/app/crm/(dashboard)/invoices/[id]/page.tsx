import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDate, formatDateTime, formatMoney } from '@/lib/format';
import { InvoiceStatusBadge } from '@/components/crm/InvoiceStatusBadge';
import { InvoiceActions } from '@/components/crm/invoices/InvoiceActions';
import { PaymentForm } from '@/components/crm/invoices/PaymentForm';
import { refreshOverdueInvoices } from '@/lib/services/overdue';

export const dynamic = 'force-dynamic';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({ where: { id }, select: { invoiceNumber: true } });
  return { title: invoice ? `Invoice ${invoice.invoiceNumber} — DSF Consult CRM` : 'Invoice — DSF Consult CRM' };
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: 'Bank Transfer',
  CARD: 'Card',
  CASH: 'Cash',
  CHEQUE: 'Cheque',
  E_TRANSFER: 'E-Transfer',
  OTHER: 'Other',
};

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;

  await refreshOverdueInvoices();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: 'asc' } },
      payments: { orderBy: { paymentDate: 'desc' } },
      lead: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!invoice) {
    notFound();
  }

  const currency = invoice.currency;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/crm/invoices" className="text-sm text-slate-400 hover:text-white">
          ← Back to Invoices
        </Link>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h1>
            <p className="mt-1 text-slate-400">
              {invoice.clientName}
              {invoice.clientBusinessName ? ` · ${invoice.clientBusinessName}` : ''}
            </p>
            {invoice.lead && (
              <Link href={`/crm/leads/${invoice.lead.id}`} className="mt-1 inline-block text-xs text-sky-300 hover:text-sky-200">
                View linked lead: {invoice.lead.firstName} {invoice.lead.lastName}
              </Link>
            )}
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Contact Information</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="mt-1 text-white">{invoice.clientEmail || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="mt-1 text-white">{invoice.clientPhone || '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Issue Date</dt>
                <dd className="mt-1 text-white">{formatDate(invoice.issueDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Due Date</dt>
                <dd className="mt-1 text-white">{formatDate(invoice.dueDate)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Line Items</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 text-right font-medium">Qty</th>
                    <th className="pb-2 text-right font-medium">Unit Price</th>
                    <th className="pb-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {invoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 text-slate-200">{item.description}</td>
                      <td className="py-2 text-right text-slate-300">{item.quantity.toString()}</td>
                      <td className="py-2 text-right text-slate-300">{formatMoney(item.unitPrice.toNumber(), currency)}</td>
                      <td className="py-2 text-right text-white">{formatMoney(item.lineTotal.toNumber(), currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mt-4 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white">{formatMoney(invoice.subtotal.toNumber(), currency)}</span>
              </div>
              {invoice.discountAmount.toNumber() > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Discount</span>
                  <span className="text-white">-{formatMoney(invoice.discountAmount.toNumber(), currency)}</span>
                </div>
              )}
              {invoice.taxAmount.toNumber() > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>{invoice.taxLabel || 'Tax'}</span>
                  <span className="text-white">{formatMoney(invoice.taxAmount.toNumber(), currency)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold">
                <span className="text-white">Total</span>
                <span className="text-white">{formatMoney(invoice.totalAmount.toNumber(), currency)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid</span>
                <span className="text-emerald-300">{formatMoney(invoice.amountPaid.toNumber(), currency)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">Outstanding Balance</span>
                <span className={invoice.amountOutstanding.toNumber() > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                  {formatMoney(invoice.amountOutstanding.toNumber(), currency)}
                </span>
              </div>
            </div>
          </section>

          {invoice.notes && (
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Notes</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-200">{invoice.notes}</p>
            </section>
          )}

          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Payment History</h2>
            <ul className="mt-4 space-y-3">
              {invoice.payments.length === 0 && <li className="text-sm text-slate-500">No payments recorded yet.</li>}
              {invoice.payments.map((payment) => (
                <li key={payment.id} className="flex items-center justify-between rounded-lg bg-white/[0.03] p-3 text-sm">
                  <div>
                    <div className="text-white">{formatMoney(payment.amount.toNumber(), currency)}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {PAYMENT_METHOD_LABELS[payment.paymentMethod] ?? payment.paymentMethod} · {formatDate(payment.paymentDate)}
                      {payment.reference ? ` · Ref: ${payment.reference}` : ''}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{formatDateTime(payment.createdAt)}</div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-300">Actions</h2>
            <InvoiceActions invoiceId={invoice.id} status={invoice.status} />
          </section>

          {invoice.status !== 'CANCELLED' && (
            <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Record Payment</h2>
              <PaymentForm invoiceId={invoice.id} outstanding={invoice.amountOutstanding.toNumber()} currency={currency} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
