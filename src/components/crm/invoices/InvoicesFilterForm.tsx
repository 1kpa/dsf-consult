'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useRef, type ChangeEvent, type FormEvent } from 'react';
import { Select } from '@/components/ui/Select';
import { PERIOD_OPTIONS } from '@/lib/date-range';

const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function InvoicesFilterForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);

  function submitWithParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    submitWithParam(event.target.name, event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const params = new URLSearchParams(searchParams.toString());
    const q = String(formData.get('q') || '');
    const clientName = String(formData.get('clientName') || '');
    if (q) params.set('q', q);
    else params.delete('q');
    if (clientName) params.set('clientName', clientName);
    else params.delete('clientName');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Search</label>
        <input
          type="search"
          name="q"
          defaultValue={searchParams.get('q') ?? ''}
          placeholder="Invoice #, client, business…"
          className="w-56 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Client</label>
        <input
          type="text"
          name="clientName"
          defaultValue={searchParams.get('clientName') ?? ''}
          placeholder="Filter by client…"
          className="w-44 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
        <Select name="status" defaultValue={searchParams.get('status') ?? ''} onChange={handleSelectChange}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Period</label>
        <Select name="period" defaultValue={searchParams.get('period') ?? 'all'} onChange={handleSelectChange}>
          {PERIOD_OPTIONS.filter((o) => o.value !== 'custom').map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Sort</label>
        <Select name="sort" defaultValue={searchParams.get('sort') ?? 'newest'} onChange={handleSelectChange}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </Select>
      </div>

      <button
        type="submit"
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
