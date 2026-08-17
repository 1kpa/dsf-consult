'use client';

import Link from 'next/link';
import { useDraggable } from '@dnd-kit/core';
import type { JourneyStage } from '@prisma/client';
import { leadAge, isOverdue, formatDate } from '@/lib/format';
import { JourneyStageBadge } from '@/components/crm/JourneyStageBadge';

export interface PipelineLeadCard {
  id: string;
  firstName: string;
  lastName: string;
  businessName: string | null;
  industry: string | null;
  source: string;
  createdAt: string;
  nextFollowUpAt: string | null;
  pipelineStageId: string | null;
  journeyStage: JourneyStage | null;
}

interface PipelineCardProps {
  lead: PipelineLeadCard;
  stages: { id: string; key: string; name: string }[];
  currentStageId: string;
  onMove: (leadId: string, stageKey: string) => void;
}

export function PipelineCard({ lead, stages, currentStageId, onMove }: PipelineCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 50 }
    : undefined;

  const overdue = isOverdue(lead.nextFollowUpAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-white/10 bg-white/[0.04] p-3 shadow-sm transition-shadow ${
        isDragging ? 'opacity-70 shadow-lg' : 'hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/crm/leads/${lead.id}`} className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-white hover:text-sky-300">
            {lead.firstName} {lead.lastName}
          </div>
          <div className="truncate text-xs text-slate-400">{lead.businessName ?? 'No business yet'}</div>
        </Link>
        {/* Drag handle: keeps the card's own link/click target free of listeners */}
        <button
          {...attributes}
          {...listeners}
          aria-label={`Drag ${lead.firstName} ${lead.lastName} to a different stage`}
          className="shrink-0 cursor-grab touch-none rounded p-1 text-slate-500 hover:bg-white/5 hover:text-slate-300 active:cursor-grabbing"
        >
          ⠿
        </button>
      </div>
      <div className="mt-2">
        <JourneyStageBadge stage={lead.journeyStage} />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
        {lead.industry && (
          <>
            <span>{lead.industry}</span>
            <span>·</span>
          </>
        )}
        <span>{lead.source}</span>
        <span>·</span>
        <span>{leadAge(lead.createdAt)} old</span>
      </div>
      {lead.nextFollowUpAt && (
        <div className={`mt-1 text-[11px] ${overdue ? 'font-medium text-rose-300' : 'text-slate-500'}`}>
          Follow-up {formatDate(lead.nextFollowUpAt)}
          {overdue ? ' (overdue)' : ''}
        </div>
      )}

      {/* Non-drag fallback: keeps stage changes fully keyboard/screen-reader accessible. */}
      <label className="mt-2 block">
        <span className="sr-only">Move {lead.firstName} {lead.lastName} to a different stage</span>
        <select
          value={currentStageId}
          onChange={(e) => {
            const stage = stages.find((s) => s.id === e.target.value);
            if (stage) onMove(lead.id, stage.key);
          }}
          className="w-full rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
