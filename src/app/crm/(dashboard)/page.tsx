import Link from 'next/link';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { formatDateTime, formatMoney, isOverdue } from '@/lib/format';
import { StatusBadge } from '@/components/crm/StatusBadge';
import { JourneyStageBadge } from '@/components/crm/JourneyStageBadge';
import { getFinanceSummary } from '@/lib/services/finance-metrics';
import { refreshOverdueInvoices } from '@/lib/services/overdue';
import { invoiceSettings } from '@/lib/settings/invoice';

export const metadata: Metadata = { title: 'Dashboard — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

function rangeToDate(range: RangeValue): Date | undefined {
  const now = new Date();
  if (range === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  if (range === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return undefined;
}

interface DashboardPageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function CrmDashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const range = (RANGE_OPTIONS.find((o) => o.value === params.range)?.value ?? 'all') as RangeValue;
  const since = rangeToDate(range);
  const createdAtFilter = since ? { createdAt: { gte: since } } : {};

  const startOfThisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  await refreshOverdueInvoices();

  const [statusCounts, journeyCounts, newAssessmentCount, appointmentCount, recentLeads, recentActivity, upcomingFollowUps, financeSummary] =
    await Promise.all([
      prisma.lead.groupBy({ by: ['status'], where: createdAtFilter, _count: { _all: true } }),
      prisma.lead.groupBy({ by: ['journeyStage'], where: createdAtFilter, _count: { _all: true } }),
      prisma.lead.count({ where: { ...createdAtFilter, journeyStage: { not: null } } }),
      prisma.appointment.count({ where: since ? { createdAt: { gte: since } } : {} }),
      prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { pipelineStage: true },
      }),
      prisma.leadActivity.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { lead: { select: { firstName: true, lastName: true, businessName: true } }, user: { select: { name: true } } },
      }),
      prisma.lead.findMany({
        where: { nextFollowUpAt: { not: null } },
        orderBy: { nextFollowUpAt: 'asc' },
        take: 6,
        select: { id: true, firstName: true, lastName: true, businessName: true, nextFollowUpAt: true, nextFollowUpType: true },
      }),
      getFinanceSummary({ gte: startOfThisMonth }),
    ]);

  const counts = Object.fromEntries(statusCounts.map((row) => [row.status, row._count._all]));
  const journeyStageCounts = Object.fromEntries(
    journeyCounts.filter((row) => row.journeyStage !== null).map((row) => [row.journeyStage as string, row._count._all])
  );
  const existingBusinessCount =
    (journeyStageCounts.EARLY_STAGE ?? 0) +
    (journeyStageCounts.GROWTH ?? 0) +
    (journeyStageCounts.SYSTEMIZATION ?? 0) +
    (journeyStageCounts.SCALING ?? 0);

  const stats = [
    { label: 'New Leads', value: counts.NEW ?? 0 },
    { label: 'Contacted', value: counts.CONTACTED ?? 0 },
    { label: 'Qualified', value: counts.QUALIFIED ?? 0 },
    { label: 'Appointments', value: appointmentCount },
    { label: 'Won', value: counts.WON ?? 0 },
    { label: 'Lost', value: counts.LOST ?? 0 },
  ];

  const journeyStats = [
    { label: 'Aspiring Founders', value: journeyStageCounts.ASPIRING_FOUNDER ?? 0 },
    { label: 'Existing Businesses', value: existingBusinessCount },
    { label: 'Growth Opportunities', value: journeyStageCounts.GROWTH ?? 0 },
    { label: 'Systemization Opportunities', value: journeyStageCounts.SYSTEMIZATION ?? 0 },
    { label: 'New Assessments', value: newAssessmentCount },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Lead pipeline overview.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1">
          {RANGE_OPTIONS.map((option) => (
            <Link
              key={option.value}
              href={option.value === 'all' ? '/crm' : `/crm?range=${option.value}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                range === option.value ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Business Journey Mix</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {journeyStats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Finance This Month</h2>
          <Link href="/crm/finance" className="text-xs font-medium text-sky-300 hover:text-sky-200">
            View Finance Dashboard →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-lg font-bold text-white">{formatMoney(financeSummary.totalRevenue, invoiceSettings.defaultCurrency)}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">Revenue This Month</div>
          </div>
          <div>
            <div className="text-lg font-bold text-emerald-300">{formatMoney(financeSummary.paid, invoiceSettings.defaultCurrency)}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">Paid This Month</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-300">{formatMoney(financeSummary.outstanding, invoiceSettings.defaultCurrency)}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">Outstanding</div>
          </div>
          <div>
            <div className="text-lg font-bold text-rose-300">{formatMoney(financeSummary.overdue, invoiceSettings.defaultCurrency)}</div>
            <div className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">Overdue</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Recent Leads</h2>
          <ul className="mt-4 space-y-3">
            {recentLeads.length === 0 && <li className="text-sm text-slate-500">No leads yet.</li>}
            {recentLeads.map((lead) => (
              <li key={lead.id}>
                <Link href={`/crm/leads/${lead.id}`} className="block rounded-lg p-2 -mx-2 hover:bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white">
                      {lead.firstName} {lead.lastName}
                    </span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-xs text-slate-400">{lead.businessName ?? 'No business yet'}</span>
                  </div>
                  <div className="mt-1.5">
                    <JourneyStageBadge stage={lead.journeyStage} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Recent Activity</h2>
          <ul className="mt-4 space-y-4">
            {recentActivity.length === 0 && <li className="text-sm text-slate-500">No activity yet.</li>}
            {recentActivity.map((activity) => (
              <li key={activity.id} className="text-sm">
                <div className="text-slate-200">{activity.message}</div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {activity.lead.firstName} {activity.lead.lastName} · {activity.user?.name ?? 'System'} ·{' '}
                  {formatDateTime(activity.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Upcoming Follow-Ups</h2>
          <ul className="mt-4 space-y-3">
            {upcomingFollowUps.length === 0 && <li className="text-sm text-slate-500">Nothing scheduled.</li>}
            {upcomingFollowUps.map((lead) => {
              const overdue = isOverdue(lead.nextFollowUpAt);
              return (
                <li key={lead.id}>
                  <Link href={`/crm/leads/${lead.id}`} className="block rounded-lg p-2 -mx-2 hover:bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">
                        {lead.firstName} {lead.lastName}
                      </span>
                      {overdue && (
                        <span className="rounded-full border border-rose-400/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-300">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {lead.nextFollowUpAt && formatDateTime(lead.nextFollowUpAt)}
                      {lead.nextFollowUpType ? ` · ${lead.nextFollowUpType}` : ''}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
