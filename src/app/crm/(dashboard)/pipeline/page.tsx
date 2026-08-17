import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PipelineBoard } from '@/components/crm/pipeline/PipelineBoard';

export const metadata: Metadata = { title: 'Pipeline — DSF Consult CRM' };
export const dynamic = 'force-dynamic';

export default async function CrmPipelinePage() {
  const [stages, leads] = await Promise.all([
    prisma.pipelineStage.findMany({ orderBy: { order: 'asc' } }),
    prisma.lead.findMany({
      where: { pipelineStageId: { not: null } },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        businessName: true,
        industry: true,
        source: true,
        createdAt: true,
        nextFollowUpAt: true,
        pipelineStageId: true,
        journeyStage: true,
      },
      take: 500,
    }),
  ]);

  const cards = leads.map((lead) => ({
    ...lead,
    source: lead.source ?? '—',
    createdAt: lead.createdAt.toISOString(),
    nextFollowUpAt: lead.nextFollowUpAt ? lead.nextFollowUpAt.toISOString() : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Pipeline</h1>
        <p className="mt-1 text-sm text-slate-400">
          Drag a card between stages, or use its stage dropdown for a keyboard-friendly alternative.
        </p>
      </div>
      <PipelineBoard stages={stages.map((s) => ({ id: s.id, key: s.key, name: s.name }))} initialLeads={cards} />
    </div>
  );
}
