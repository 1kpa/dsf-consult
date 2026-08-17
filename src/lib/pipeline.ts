import type { LeadStatus } from '@prisma/client';

/**
 * Seeded pipeline stages (see prisma/seed.ts). `key` is stable and used for
 * lookups/seeding; `order` drives the Kanban column order.
 */
export const PIPELINE_STAGES = [
  { key: 'new_lead', name: 'New Lead', order: 0 },
  { key: 'contacted', name: 'Contacted', order: 1 },
  { key: 'qualified', name: 'Qualified', order: 2 },
  { key: 'strategy_call', name: 'Strategy Call', order: 3 },
  { key: 'proposal', name: 'Proposal', order: 4 },
  { key: 'won', name: 'Won', order: 5 },
  { key: 'lost', name: 'Lost', order: 6 },
] as const;

export type PipelineStageKey = (typeof PIPELINE_STAGES)[number]['key'];

/**
 * Keeps the coarse `Lead.status` lifecycle field roughly in sync with the
 * more granular Kanban `PipelineStage`. Only stages with an unambiguous
 * status implication are mapped; others (e.g. "Strategy Call") leave the
 * existing status untouched.
 */
export const STAGE_KEY_TO_STATUS: Partial<Record<PipelineStageKey, LeadStatus>> = {
  new_lead: 'NEW',
  contacted: 'CONTACTED',
  qualified: 'QUALIFIED',
  won: 'WON',
  lost: 'LOST',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  NURTURE: 'Nurture',
  WON: 'Won',
  LOST: 'Lost',
};

export const FOLLOW_UP_TYPE_LABELS: Record<string, string> = {
  CALL: 'Call',
  EMAIL: 'Email',
  SMS: 'SMS',
  MEETING: 'Meeting',
  OTHER: 'Other',
};
