import type { InvoiceStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { groupKey, type GroupByValue } from '@/lib/date-range';

const ISSUED_STATUSES: InvoiceStatus[] = ['SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE'];

export interface FinanceSummary {
  totalRevenue: number;
  paid: number;
  pending: number;
  overdue: number;
  outstanding: number;
  invoicesSent: number;
  invoicesPaid: number;
  averageInvoiceValue: number;
}

/**
 * Financial reporting always reads from Invoice/Payment records, never from
 * Lead data — see PHASE 4 requirement not to infer revenue from leads
 * alone. DRAFT invoices are excluded (not yet real commitments); CANCELLED
 * invoices are always excluded.
 */
export async function getFinanceSummary(issueDateFilter: Prisma.DateTimeFilter | undefined): Promise<FinanceSummary> {
  const baseWhere: Prisma.InvoiceWhereInput = {
    status: { in: ISSUED_STATUSES },
    ...(issueDateFilter ? { issueDate: issueDateFilter } : {}),
  };

  const [totals, pendingAgg, overdueAgg, paidCount] = await Promise.all([
    prisma.invoice.aggregate({ where: baseWhere, _sum: { totalAmount: true, amountPaid: true }, _count: { _all: true } }),
    prisma.invoice.aggregate({
      where: { ...baseWhere, status: { in: ['SENT', 'PARTIALLY_PAID'] } },
      _sum: { amountOutstanding: true },
    }),
    prisma.invoice.aggregate({ where: { ...baseWhere, status: 'OVERDUE' }, _sum: { amountOutstanding: true } }),
    prisma.invoice.count({ where: { ...baseWhere, status: 'PAID' } }),
  ]);

  const totalRevenue = totals._sum.totalAmount?.toNumber() ?? 0;
  const paid = totals._sum.amountPaid?.toNumber() ?? 0;
  const pending = pendingAgg._sum.amountOutstanding?.toNumber() ?? 0;
  const overdue = overdueAgg._sum.amountOutstanding?.toNumber() ?? 0;
  const invoicesSent = totals._count._all;

  return {
    totalRevenue,
    paid,
    pending,
    overdue,
    outstanding: pending + overdue,
    invoicesSent,
    invoicesPaid: paidCount,
    averageInvoiceValue: invoicesSent > 0 ? totalRevenue / invoicesSent : 0,
  };
}

export interface RevenueByPeriodPoint {
  key: string;
  sortKey: number;
  label: string;
  paid: number;
  outstanding: number;
}

export async function getRevenueByPeriod(
  issueDateFilter: Prisma.DateTimeFilter | undefined,
  groupBy: GroupByValue
): Promise<RevenueByPeriodPoint[]> {
  const rows = await prisma.invoice.findMany({
    where: { status: { in: ISSUED_STATUSES }, ...(issueDateFilter ? { issueDate: issueDateFilter } : {}) },
    select: { issueDate: true, amountPaid: true, amountOutstanding: true },
    orderBy: { issueDate: 'asc' },
  });

  const buckets = new Map<string, RevenueByPeriodPoint>();
  for (const row of rows) {
    const label = groupKey(row.issueDate, groupBy);
    const existing = buckets.get(label);
    const paid = row.amountPaid.toNumber();
    const outstanding = row.amountOutstanding.toNumber();
    if (existing) {
      existing.paid += paid;
      existing.outstanding += outstanding;
    } else {
      buckets.set(label, { key: label, sortKey: row.issueDate.getTime(), label, paid, outstanding });
    }
  }

  return Array.from(buckets.values()).sort((a, b) => a.sortKey - b.sortKey);
}

export interface ClientRevenuePoint {
  clientName: string;
  amount: number;
}

export async function getTopClients(
  issueDateFilter: Prisma.DateTimeFilter | undefined,
  by: 'revenue' | 'outstanding',
  limit = 5
): Promise<ClientRevenuePoint[]> {
  const rows = await prisma.invoice.findMany({
    where: { status: { in: ISSUED_STATUSES }, ...(issueDateFilter ? { issueDate: issueDateFilter } : {}) },
    select: { clientName: true, totalAmount: true, amountOutstanding: true },
  });

  const totals = new Map<string, number>();
  for (const row of rows) {
    const value = by === 'revenue' ? row.totalAmount.toNumber() : row.amountOutstanding.toNumber();
    totals.set(row.clientName, (totals.get(row.clientName) ?? 0) + value);
  }

  return Array.from(totals.entries())
    .map(([clientName, amount]) => ({ clientName, amount }))
    .filter((entry) => entry.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
