import Link from 'next/link';
import type { Metadata } from 'next';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { leadsQuerySchema } from '@/lib/validation/crm';
import { INDUSTRY_OPTIONS } from '@/lib/validation/lead';
import { LEAD_STATUS_LABELS } from '@/lib/pipeline';
import { JOURNEY_STAGE_LABELS } from '@/lib/journey';
import { formatDate } from '@/lib/format';
import { StatusBadge } from '@/components/crm/StatusBadge';
import { JourneyStageBadge } from '@/components/crm/JourneyStageBadge';
import { LeadsFilterForm } from '@/components/crm/LeadsFilterForm';

export const metadata: Metadata = { title: 'Leads — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;

interface LeadsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function CrmLeadsPage({ searchParams }: LeadsPageProps) {
  const rawParams = await searchParams;
  const query = leadsQuerySchema.parse(rawParams);

  const where: Prisma.LeadWhereInput = {};
  if (query.q) {
    where.OR = [
      { firstName: { contains: query.q, mode: 'insensitive' } },
      { lastName: { contains: query.q, mode: 'insensitive' } },
      { businessName: { contains: query.q, mode: 'insensitive' } },
      { email: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  if (query.industry) where.industry = query.industry;
  if (query.stage) where.pipelineStage = { key: query.stage };
  if (query.status) where.status = query.status;
  if (query.journey) where.journeyStage = query.journey;

  const [total, leads, stages] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: query.sort === 'oldest' ? 'asc' : 'desc' },
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { pipelineStage: true, leadSource: true, assignedTo: { select: { name: true } } },
    }),
    prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const statuses = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const journeyStages = Object.entries(JOURNEY_STAGE_LABELS).map(([value, label]) => ({ value, label }));

  function buildParams(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged = {
      q: query.q,
      industry: query.industry,
      stage: query.stage,
      status: query.status,
      journey: query.journey,
      sort: query.sort,
      page: query.page,
      ...overrides,
    };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    return params;
  }

  function pageHref(page: number) {
    return `/crm/leads?${buildParams({ page }).toString()}`;
  }

  function sortHref(sort: 'newest' | 'oldest') {
    return `/crm/leads?${buildParams({ sort, page: undefined }).toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="mt-1 text-sm text-slate-400">{total} lead{total === 1 ? '' : 's'} total.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <LeadsFilterForm industries={INDUSTRY_OPTIONS} stages={stages} statuses={statuses} journeyStages={journeyStages} />
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1 text-sm">
          <Link
            href={sortHref('newest')}
            className={`rounded-md px-3 py-1.5 font-medium ${query.sort !== 'oldest' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'}`}
          >
            Newest
          </Link>
          <Link
            href={sortHref('oldest')}
            className={`rounded-md px-3 py-1.5 font-medium ${query.sort === 'oldest' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-white'}`}
          >
            Oldest
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Journey Stage</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Industry</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Stage</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Next Follow-Up</th>
              <th className="px-4 py-3 font-medium">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-10 text-center text-slate-500">
                  No leads match these filters.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-4 py-3">
                  <Link href={`/crm/leads/${lead.id}`} className="font-medium text-white hover:text-sky-300">
                    {lead.firstName} {lead.lastName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <JourneyStageBadge stage={lead.journeyStage} />
                </td>
                <td className="px-4 py-3 text-slate-300">{lead.businessName ?? '—'}</td>
                <td className="px-4 py-3 text-slate-300">{lead.industry ?? '—'}</td>
                <td className="px-4 py-3 text-slate-400">{lead.leadSource?.name ?? lead.source ?? '—'}</td>
                <td className="px-4 py-3 text-slate-300">{lead.pipelineStage?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-slate-400">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3 text-slate-400">
                  {lead.nextFollowUpAt ? formatDate(lead.nextFollowUpAt) : '—'}
                </td>
                <td className="px-4 py-3 text-slate-400">{lead.assignedTo?.name ?? 'Unassigned'}</td>
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
