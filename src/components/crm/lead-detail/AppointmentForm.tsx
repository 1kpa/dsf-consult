'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { FOLLOW_UP_TYPE_LABELS } from '@/lib/pipeline';
import { Select } from '@/components/ui/Select';

const APPOINTMENT_TYPES = ['MEETING', 'CALL', 'EMAIL', 'SMS', 'OTHER'] as const;

export function AppointmentForm({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [date, setDate] = useState('');
  const [type, setType] = useState<(typeof APPOINTMENT_TYPES)[number]>('MEETING');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/crm/leads/${leadId}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledFor: new Date(date).toISOString(), type, notes }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Unable to create appointment');
      }
      setDate('');
      setNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex flex-wrap items-end gap-3">
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
          <Select value={type} onChange={(e) => setType(e.target.value as (typeof APPOINTMENT_TYPES)[number])}>
            {APPOINTMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {FOLLOW_UP_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
        <button
          type="submit"
          disabled={submitting || !date}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Create Appointment'}
        </button>
      </div>
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes"
        className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
      />
    </form>
  );
}
