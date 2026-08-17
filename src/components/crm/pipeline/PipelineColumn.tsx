'use client';

import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface PipelineColumnProps {
  stageId: string;
  title: string;
  count: number;
  children: ReactNode;
}

export function PipelineColumn({ stageId, title, count, children }: PipelineColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stageId });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border p-3 transition-colors ${
        isOver ? 'border-sky-400/50 bg-sky-500/5' : 'border-white/10 bg-white/[0.02]'
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{count}</span>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto">{children}</div>
    </div>
  );
}
