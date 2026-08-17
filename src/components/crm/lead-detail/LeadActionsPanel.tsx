'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LEAD_STATUS_LABELS, FOLLOW_UP_TYPE_LABELS } from '@/lib/pipeline';

interface LeadActionsPanelProps {
  leadId: string;
  currentStageKey: string | null;
  currentStatus: string;
  stages: { key: string; name: string }[];
}

async function patchLead(leadId: string, body: Record<string, unknown>) {
  const response = await fetch(`/api/crm/leads/${leadId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Update failed');
  }
}

export function LeadActionsPanel({ leadId, currentStageKey, currentStatus, stages }: LeadActionsPanelProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(key: string, body: Record<string, unknown>) {
    setPending(key);
    setError(null);
    try {
      await patchLead(leadId, body);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Actions</h2>
      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Pipeline Stage</label>
          <select
            defaultValue={currentStageKey ?? ''}
            disabled={pending !== null}
            onChange={(e) => run('stage', { pipelineStageKey: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          >
            <option value="" disabled>
              Select stage…
            </option>
            {stages.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
          <select
            defaultValue={currentStatus}
            disabled={pending !== null}
            onChange={(e) => run('status', { status: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          >
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
        <button
          disabled={pending !== null}
          onClick={() => run('won', { status: 'WON' })}
          className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
        >
          Mark Won
        </button>
        <button
          disabled={pending !== null}
          onClick={() => run('lost', { status: 'LOST' })}
          className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
        >
          Mark Lost
        </button>
      </div>

      <div className="border-t border-white/10 pt-4">
        <div className="mb-2 text-xs font-medium text-slate-400">Record Manual Contact</div>
        <div className="flex flex-wrap gap-2">
          {(['CALL', 'EMAIL', 'SMS'] as const).map((type) => (
            <button
              key={type}
              disabled={pending !== null}
              onClick={() => run(`contact-${type}`, { recordContact: type })}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-white/20 hover:text-white disabled:opacity-60"
            >
              {FOLLOW_UP_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
