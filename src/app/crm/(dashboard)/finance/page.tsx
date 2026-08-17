import Link from 'next/link';
import type { Metadata } from 'next';
import { resolveDateRange, type PeriodValue, type GroupByValue } from '@/lib/date-range';
import { getFinanceSummary, getRevenueByPeriod, getTopClients } from '@/lib/services/finance-metrics';
import { refreshOverdueInvoices } from '@/lib/services/overdue';
import { formatMoney } from '@/lib/format';
import { DateRangeFilter } from '@/components/crm/finance/DateRangeFilter';
import { RevenueChart } from '@/components/crm/finance/RevenueChart';
import { invoiceSettings } from '@/lib/settings/invoice';

export const metadata: Metadata = { title: 'Finance — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

interface FinancePageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string; groupBy?: string }>;
}

export default async function CrmFinancePage({ searchParams }: FinancePageProps) {
  const params = await searchParams;
  const period = (params.period ?? 'this_year') as PeriodValue;
  const groupBy = (params.groupBy ?? 'month') as GroupByValue;
  const { from, to } = resolveDateRange(period, params.from, params.to);
  const issueDateFilter = from || to ? { ...(from ? { gte: from } : {}), ...(to ? { lt: to } : {}) } : undefined;

  await refreshOverdueInvoices();

  const [summary, chartData, topByRevenue, topByOutstanding] = await Promise.all([
    getFinanceSummary(issueDateFilter),
    getRevenueByPeriod(issueDateFilter, groupBy),
    getTopClients(issueDateFilter, 'revenue'),
    getTopClients(issueDateFilter, 'outstanding'),
  ]);

  const currency = invoiceSettings.defaultCurrency;

  const summaryCards = [
    { label: 'Total Revenue', value: summary.totalRevenue },
    { label: 'Paid', value: summary.paid },
    { label: 'Pending', value: summary.pending },
    { label: 'Overdue', value: summary.overdue },
    { label: 'Outstanding', value: summary.outstanding },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance</h1>
          <p className="mt-1 text-sm text-slate-400">Revenue and payment reporting from actual invoice records.</p>
        </div>
        <Link
          href="/crm/invoices"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
        >
          View Invoices
        </Link>
      </div>

      <DateRangeFilter period={period} groupBy={groupBy} from={params.from} to={params.to} />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xl font-bold text-white">{formatMoney(card.value, currency)}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xl font-bold text-white">{summary.invoicesSent}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">Invoices Sent</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xl font-bold text-white">{summary.invoicesPaid}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">Invoices Paid</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xl font-bold text-white">{formatMoney(summary.averageInvoiceValue, currency)}</div>
          <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">Average Invoice Value</div>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Revenue</h2>
        <div className="mt-4">
          <RevenueChart data={chartData.map((p) => ({ label: p.label, paid: p.paid, outstanding: p.outstanding }))} currency={currency} />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Top Clients by Revenue</h2>
          <ul className="mt-4 space-y-3">
            {topByRevenue.length === 0 && <li className="text-sm text-slate-500">No data yet.</li>}
            {topByRevenue.map((client) => (
              <li key={client.clientName} className="flex items-center justify-between text-sm">
                <span className="text-slate-200">{client.clientName}</span>
                <span className="font-medium text-white">{formatMoney(client.amount, currency)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Top Clients by Outstanding Balance</h2>
          <ul className="mt-4 space-y-3">
            {topByOutstanding.length === 0 && <li className="text-sm text-slate-500">No outstanding balances.</li>}
            {topByOutstanding.map((client) => (
              <li key={client.clientName} className="flex items-center justify-between text-sm">
                <span className="text-slate-200">{client.clientName}</span>
                <span className="font-medium text-rose-300">{formatMoney(client.amount, currency)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
