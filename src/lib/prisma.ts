import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Falls back to a syntactically valid (but unreachable) local Postgres URL so
// that constructing the client never throws at module-import time when
// DATABASE_URL isn't configured yet — this keeps `next build` and route
// analysis working even before a real database is connected. Actual queries
// will fail at request time with a normal connection error, which callers
// handle and report safely (see lib/api-response.ts).
const FALLBACK_DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dsf_consult?schema=public';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL || FALLBACK_DATABASE_URL;
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
