'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { PipelineColumn } from './PipelineColumn';
import { PipelineCard, type PipelineLeadCard } from './PipelineCard';

interface PipelineStageInfo {
  id: string;
  key: string;
  name: string;
}

interface PipelineBoardProps {
  stages: PipelineStageInfo[];
  initialLeads: PipelineLeadCard[];
}

export function PipelineBoard({ stages, initialLeads }: PipelineBoardProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [error, setError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const leadsByStage = useMemo(() => {
    const grouped = new Map<string, PipelineLeadCard[]>();
    for (const stage of stages) grouped.set(stage.id, []);
    for (const lead of leads) {
      if (lead.pipelineStageId && grouped.has(lead.pipelineStageId)) {
        grouped.get(lead.pipelineStageId)!.push(lead);
      }
    }
    return grouped;
  }, [leads, stages]);

  async function moveLead(leadId: string, stageKey: string) {
    const targetStage = stages.find((s) => s.key === stageKey);
    if (!targetStage) return;

    const previousLeads = leads;
    setLeads((current) =>
      current.map((lead) => (lead.id === leadId ? { ...lead, pipelineStageId: targetStage.id } : lead))
    );
    setError(null);

    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pipelineStageKey: stageKey }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to move lead');
      }
      router.refresh();
    } catch (err) {
      setLeads(previousLeads);
      setError(err instanceof Error ? err.message : 'Unable to move lead. Please try again.');
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const leadId = String(active.id);
    const targetStageId = String(over.id);
    const targetStage = stages.find((s) => s.id === targetStageId);
    if (targetStage) {
      void moveLead(leadId, targetStage.key);
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => {
            const stageLeads = leadsByStage.get(stage.id) ?? [];
            return (
              <PipelineColumn key={stage.id} stageId={stage.id} title={stage.name} count={stageLeads.length}>
                {stageLeads.map((lead) => (
                  <PipelineCard
                    key={lead.id}
                    lead={lead}
                    stages={stages}
                    currentStageId={stage.id}
                    onMove={moveLead}
                  />
                ))}
              </PipelineColumn>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}
