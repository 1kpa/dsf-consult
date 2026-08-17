'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FOLLOW_UP_TYPE_LABELS } from '@/lib/pipeline';

const FOLLOW_UP_TYPES = ['CALL', 'EMAIL', 'SMS', 'MEETING', 'OTHER'] as const;

export function FollowUpForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [type, setType] = useState<(typeof FOLLOW_UP_TYPES)[number]>('CALL');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextFollowUpAt: new Date(date).toISOString(), nextFollowUpType: type }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to schedule follow-up');
      }
      setDate('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      {error && <p className="w-full text-sm text-rose-300">{error}</p>}
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Date &amp; Time</label>
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as (typeof FOLLOW_UP_TYPES)[number])}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
        >
          {FOLLOW_UP_TYPES.map((t) => (
            <option key={t} value={t}>
              {FOLLOW_UP_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting || !date}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Schedule Follow-Up'}
      </button>
    </form>
  );
}
