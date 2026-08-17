import type { Prisma } from '@prisma/client';
import type { InvoicesQuery } from '@/lib/validation/invoice';
import { resolveDateRange } from '@/lib/date-range';

export function buildInvoiceWhere(query: InvoicesQuery): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = {};

  if (query.q) {
    where.OR = [
      { invoiceNumber: { contains: query.q, mode: 'insensitive' } },
      { clientName: { contains: query.q, mode: 'insensitive' } },
      { clientBusinessName: { contains: query.q, mode: 'insensitive' } },
    ];
  }
  if (query.status) where.status = query.status;
  if (query.clientName) where.clientName = { contains: query.clientName, mode: 'insensitive' };

  const { from, to } = resolveDateRange(query.period, query.from, query.to);
  if (from || to) {
    where.issueDate = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lt: to } : {}),
    };
  }

  return where;
}

export function invoiceOrderBy(sort: InvoicesQuery['sort']): Prisma.InvoiceOrderByWithRelationInput {
  if (sort === 'oldest') return { issueDate: 'asc' };
  if (sort === 'highest') return { totalAmount: 'desc' };
  if (sort === 'lowest') return { totalAmount: 'asc' };
  return { issueDate: 'desc' };
}
