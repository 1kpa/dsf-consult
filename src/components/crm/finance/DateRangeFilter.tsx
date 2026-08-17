'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { PERIOD_OPTIONS, GROUP_BY_OPTIONS, type PeriodValue, type GroupByValue } from '@/lib/date-range';
import { Select } from '@/components/ui/Select';

interface DateRangeFilterProps {
  period: PeriodValue;
  groupBy: GroupByValue;
  from?: string;
  to?: string;
  showGroupBy?: boolean;
}

export function DateRangeFilter({ period, groupBy, from, to, showGroupBy = true }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customFrom, setCustomFrom] = useState(from ?? '');
  const [customTo, setCustomTo] = useState(to ?? '');

  function navigate(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(overrides)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePeriodChange(value: string) {
    if (value === 'custom') {
      navigate({ period: value, from: customFrom || undefined, to: customTo || undefined });
    } else {
      navigate({ period: value, from: undefined, to: undefined });
    }
  }

  function handleCustomSubmit(event: FormEvent) {
    event.preventDefault();
    navigate({ period: 'custom', from: customFrom || undefined, to: customTo || undefined });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-400">Period</label>
        <Select value={period} onChange={(e) => handlePeriodChange(e.target.value)}>
          {PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {period === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
          >
            Apply
          </button>
        </form>
      )}

      {showGroupBy && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Group By</label>
          <Select value={groupBy} onChange={(e) => navigate({ groupBy: e.target.value })}>
            {GROUP_BY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
}
