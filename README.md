# DSF Consult

Marketing site + internal CRM, built on Next.js (App Router), Prisma, and PostgreSQL.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL / SESSION_SECRET
npm run db:migrate     # creates tables (requires a running Postgres — see below)
npm run db:seed        # seeds pipeline stages, lead sources, an admin user, and sample leads
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site, and
[http://localhost:3000/crm](http://localhost:3000/crm) for the internal CRM.

### Database (PostgreSQL required)

This project is not usable end-to-end without a real PostgreSQL database — the
public form, CRM login, and every CRM page all read/write through Prisma. The
app is set up so it **compiles and type-checks without one** (see
`src/lib/prisma.ts`), but any page or API route that touches the database
will fail at request time until `DATABASE_URL` points at a real instance.

**Option A — local PostgreSQL**

1. Install PostgreSQL locally (e.g. via the official installer, or
   `winget install PostgreSQL.PostgreSQL`) and make sure it's running on
   `localhost:5432`.
2. Create a database: `createdb dsf_consult` (or via `psql`).
3. Set `DATABASE_URL` in `.env` to match, e.g.
   `postgresql://postgres:postgres@localhost:5432/dsf_consult?schema=public`.
4. Run `npm run db:migrate` then `npm run db:seed`.

**Option B — Railway PostgreSQL (recommended before deploying)**

1. Create a Railway project and add a PostgreSQL plugin.
2. Copy the `DATABASE_URL` connection string from the plugin's Variables tab.
3. Set it locally in `.env` (for migrating from your machine) and in
   Railway's own environment variables (for the deployed app).
4. Run `npm run db:migrate` locally against that URL once, then
   `npm run db:seed`.

Deployment itself (Railway build/deploy config) is out of scope for this
phase — only the database connection is being prepared.

### Default CRM login

The seed script creates one admin user:

- Email: `admin@dsfconsult.com` (override with `SEED_ADMIN_EMAIL`)
- Password: `ChangeMe123!` (override with `SEED_ADMIN_PASSWORD`)

**Change this password (or re-seed with your own) before using this anywhere
other than local development.** There is no public registration — CRM users
are only created via the seed script or direct database access.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Start the production server (after `build`) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Create/apply a local migration (`prisma migrate dev`) |
| `npm run db:deploy` | Apply existing migrations without prompting (for CI/production) |
| `npm run db:seed` | Seed pipeline stages, lead sources, admin user, sample leads |
| `npm run db:studio` | Open Prisma Studio to browse the database |

## Architecture notes

- **Prisma 7**: the database connection URL lives in `prisma.config.ts` (used
  by the CLI/migrate), not in `schema.prisma` — Prisma 7 removed
  `datasource.url`. The runtime client in `src/lib/prisma.ts` connects via
  the `@prisma/adapter-pg` driver adapter.
- **Auth**: CRM sessions are signed JWT cookies (`jose`, HS256), verified in
  `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`) and again
  in each CRM API route for defense in depth. Passwords are hashed with
  `bcryptjs`.
- **Public lead form → CRM**: `POST /api/leads` validates with Zod, applies
  an in-memory rate limit + honeypot/fill-time spam checks, upserts the
  `Lead` by email (so re-submissions update the existing record instead of
  creating duplicates), and writes a `LeadActivity`. See
  `src/lib/services/events.ts` for the event hook future integrations
  (Twilio, Resend, n8n, Zapier, ad platform conversions, etc.) attach to.
- **CRM mutations**: stage/status changes, notes, follow-ups, and
  appointments go through `PATCH /api/crm/leads/[id]`,
  `POST /api/crm/leads/[id]/notes`, and
  `POST /api/crm/leads/[id]/appointments` — every one writes a
  `LeadActivity`. The Pipeline board fetches its initial data server-side and
  calls the same PATCH endpoint on drag-and-drop (and via a plain `<select>`
  per card as a non-drag, keyboard-accessible fallback).
