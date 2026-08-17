'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

interface InvoiceActionsProps {
  invoiceId: string;
  status: string;
}

export function InvoiceActions({ invoiceId, status }: InvoiceActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runStatusAction(action: 'MARK_SENT' | 'CANCEL' | 'RESTORE') {
    setPending(action);
    setError(null);
    try {
      const response = await fetch(`/api/crm/invoices/${invoiceId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Action failed');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPending(null);
    }
  }

  async function handleDuplicate() {
    setPending('DUPLICATE');
    setError(null);
    try {
      const response = await fetch(`/api/crm/invoices/${invoiceId}/duplicate`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Unable to duplicate invoice');
      router.push(`/crm/invoices/${result.invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setPending(null);
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-rose-300">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {status !== 'CANCELLED' && (
          <Link
            href={`/crm/invoices/${invoiceId}/edit`}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
          >
            Edit Invoice
          </Link>
        )}

        {status === 'DRAFT' && (
          <button
            disabled={pending !== null}
            onClick={() => runStatusAction('MARK_SENT')}
            className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-sm font-medium text-sky-300 hover:bg-sky-500/20 disabled:opacity-60"
          >
            Mark as Sent
          </button>
        )}

        <a
          href={`/api/crm/invoices/${invoiceId}/pdf`}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
        >
          Download PDF
        </a>

        <button
          disabled={pending !== null}
          onClick={handleDuplicate}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white disabled:opacity-60"
        >
          Duplicate Invoice
        </button>

        {status !== 'CANCELLED' ? (
          <button
            disabled={pending !== null}
            onClick={() => runStatusAction('CANCEL')}
            className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-60"
          >
            Cancel Invoice
          </button>
        ) : (
          <button
            disabled={pending !== null}
            onClick={() => runStatusAction('RESTORE')}
            className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60"
          >
            Restore Invoice
          </button>
        )}
      </div>
    </div>
  );
}
