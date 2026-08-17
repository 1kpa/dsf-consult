import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

// Prisma 7 config file: connection URL for Migrate/CLI commands (the
// PrismaPg driver adapter in src/lib/prisma.ts handles the runtime client).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
