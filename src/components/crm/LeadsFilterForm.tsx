'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useRef, type ChangeEvent, type FormEvent } from 'react';

interface LeadsFilterFormProps {
  industries: readonly string[];
  stages: { key: string; name: string }[];
  statuses: { value: string; label: string }[];
  journeyStages: { value: string; label: string }[];
}

export function LeadsFilterForm({ industries, stages, statuses, journeyStages }: LeadsFilterFormProps) {
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
    submitWithParam('q', String(formData.get('q') || ''));
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        name="q"
        defaultValue={searchParams.get('q') ?? ''}
        placeholder="Search name, business, email…"
        className="w-64 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
      />

      <select
        name="journey"
        defaultValue={searchParams.get('journey') ?? ''}
        onChange={handleSelectChange}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
      >
        <option value="">All Journey Stages</option>
        {journeyStages.map((stage) => (
          <option key={stage.value} value={stage.value}>
            {stage.label}
          </option>
        ))}
      </select>

      <select
        name="industry"
        defaultValue={searchParams.get('industry') ?? ''}
        onChange={handleSelectChange}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
      >
        <option value="">All Industries</option>
        {industries.map((industry) => (
          <option key={industry} value={industry}>
            {industry}
          </option>
        ))}
      </select>

      <select
        name="stage"
        defaultValue={searchParams.get('stage') ?? ''}
        onChange={handleSelectChange}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
      >
        <option value="">All Stages</option>
        {stages.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.name}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue={searchParams.get('status') ?? ''}
        onChange={handleSelectChange}
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
      >
        <option value="">All Statuses</option>
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:border-white/20 hover:text-white"
      >
        Search
      </button>
    </form>
  );
}
