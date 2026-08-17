'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Select } from '@/components/ui/Select';

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'E_TRANSFER', label: 'E-Transfer' },
  { value: 'OTHER', label: 'Other' },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function PaymentForm({ invoiceId, outstanding, currency }: { invoiceId: string; outstanding: number; currency: string }) {
  const router = useRouter();
  const [amount, setAmount] = useState(outstanding > 0 ? String(outstanding) : '');
  const [paymentDate, setPaymentDate] = useState(todayIso());
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch(`/api/crm/invoices/${invoiceId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          paymentDate: new Date(paymentDate).toISOString(),
          paymentMethod,
          reference,
          notes,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to record payment');
      setAmount('');
      setReference('');
      setNotes('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  if (outstanding <= 0) {
    return <p className="text-sm text-slate-500">This invoice is fully paid.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Amount ({currency})</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max={outstanding}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Date</label>
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Payment Method</label>
        <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full">
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 disabled:opacity-60"
      >
        {submitting ? 'Recording…' : 'Record Payment'}
      </button>
    </form>
  );
}
