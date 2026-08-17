import { z } from 'zod';

const FOLLOW_UP_TYPES = ['CALL', 'EMAIL', 'SMS', 'MEETING', 'OTHER'] as const;
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'NURTURE', 'WON', 'LOST'] as const;
const JOURNEY_STAGES = ['ASPIRING_FOUNDER', 'EARLY_STAGE', 'GROWTH', 'SYSTEMIZATION', 'SCALING', 'UNSURE'] as const;

/**
 * PATCH /api/crm/leads/[id]. Every field is optional — the caller sends only
 * what changed. `pipelineStageKey` (not a raw DB id) is what the client ever
 * sends for stage moves; the server resolves it server-side so clients can
 * never smuggle an arbitrary/invalid pipeline stage or status straight through.
 */
export const updateLeadSchema = z
  .object({
    pipelineStageKey: z.string().trim().min(1).max(100).optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    nextFollowUpAt: z.string().datetime().nullable().optional(),
    nextFollowUpType: z.enum(FOLLOW_UP_TYPES).nullable().optional(),
    recordContact: z.enum(FOLLOW_UP_TYPES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No changes provided' });

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const createNoteSchema = z.object({
  content: z.string().trim().min(1, 'Note cannot be empty').max(5000),
});

export const createAppointmentSchema = z.object({
  scheduledFor: z.string().datetime('Enter a valid date/time'),
  type: z.enum(FOLLOW_UP_TYPES).default('MEETING'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const leadsQuerySchema = z.object({
  q: z.string().trim().max(200).optional(),
  industry: z.string().trim().max(100).optional(),
  stage: z.string().trim().max(100).optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  journey: z.enum(JOURNEY_STAGES).optional(),
  sort: z.enum(['newest', 'oldest']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  range: z.enum(['today', '7d', '30d', 'all']).default('all'),
});
