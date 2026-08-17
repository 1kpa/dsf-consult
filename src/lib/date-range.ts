export const PERIOD_OPTIONS = [
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year' },
  { value: 'last_year', label: 'Last Year' },
  { value: 'all', label: 'All Time' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value'];

export const GROUP_BY_OPTIONS = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
] as const;

export type GroupByValue = (typeof GROUP_BY_OPTIONS)[number]['value'];

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function startOfQuarter(date: Date): Date {
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth, 1, 0, 0, 0, 0);
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

export function resolveDateRange(period: PeriodValue, customFrom?: string, customTo?: string, now = new Date()): DateRange {
  switch (period) {
    case 'this_month': {
      const from = startOfMonth(now);
      const to = new Date(from.getFullYear(), from.getMonth() + 1, 1);
      return { from, to };
    }
    case 'last_month': {
      const to = startOfMonth(now);
      const from = new Date(to.getFullYear(), to.getMonth() - 1, 1);
      return { from, to };
    }
    case 'this_quarter': {
      const from = startOfQuarter(now);
      const to = new Date(from.getFullYear(), from.getMonth() + 3, 1);
      return { from, to };
    }
    case 'last_quarter': {
      const to = startOfQuarter(now);
      const from = new Date(to.getFullYear(), to.getMonth() - 3, 1);
      return { from, to };
    }
    case 'this_year': {
      const from = startOfYear(now);
      const to = new Date(from.getFullYear() + 1, 0, 1);
      return { from, to };
    }
    case 'last_year': {
      const to = startOfYear(now);
      const from = new Date(to.getFullYear() - 1, 0, 1);
      return { from, to };
    }
    case 'custom': {
      const from = customFrom ? new Date(customFrom) : undefined;
      const to = customTo ? new Date(new Date(customTo).getTime() + 24 * 60 * 60 * 1000) : undefined;
      return { from, to };
    }
    case 'all':
    default:
      return { from: undefined, to: undefined };
  }
}

export function quarterLabel(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `Q${q} ${date.getFullYear()}`;
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function groupKey(date: Date, groupBy: GroupByValue): string {
  if (groupBy === 'year') return String(date.getFullYear());
  if (groupBy === 'quarter') return quarterLabel(date);
  return monthLabel(date);
}
