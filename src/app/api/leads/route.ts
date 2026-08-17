import type { NextRequest } from 'next/server';
import type { JourneyStage } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonError, jsonSuccess } from '@/lib/api-response';
import { leadSubmissionSchema, MIN_FORM_FILL_TIME_MS, type LeadSubmissionInput } from '@/lib/validation/lead';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { emitLeadEvent } from '@/lib/services/events';
import { generateLeadTags } from '@/lib/services/tags';

export const dynamic = 'force-dynamic';

const WEBSITE_LEAD_SOURCE_KEY = 'website_systems_audit';

// Fields that only some journey-stage branches collect. Only fields with an
// actual non-empty value are included in the write, so a later submission
// (possibly from a different branch) never blanks out previously-captured
// CRM data.
const OPTIONAL_TEXT_FIELDS = [
  'businessName',
  'industry',
  'monthlyLeadVolume',
  'currentLeadProcess',
  'primaryChallenge',
  'desiredOutcome',
  'businessIdeaStatus',
  'skillsAndExperience',
  'primaryGoal',
  'startTimeline',
  'currentOffer',
  'hasWebsite',
  'hasCRM',
  'hasCustomers',
  'customerAcquisitionSources',
  'message',
] as const satisfies readonly (keyof LeadSubmissionInput)[];

// Plain scalar shape (no Prisma relation/operation wrappers) — assignable to
// both `create` and `update` input types, so it can be spread into either
// half of the upsert below without fighting Prisma's discriminated types.
interface ProvidedLeadFields {
  firstName: string;
  lastName: string;
  phone: string;
  journeyStage: JourneyStage;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  landingPage: string | null;
  businessName?: string;
  industry?: string;
  monthlyLeadVolume?: string;
  currentLeadProcess?: string;
  primaryChallenge?: string;
  desiredOutcome?: string;
  businessIdeaStatus?: string;
  skillsAndExperience?: string;
  primaryGoal?: string;
  startTimeline?: string;
  currentOffer?: string;
  hasWebsite?: string;
  hasCRM?: string;
  hasCustomers?: string;
  customerAcquisitionSources?: string;
  message?: string;
  desiredSupport?: string[];
}

function buildProvidedFields(data: LeadSubmissionInput, landingPage: string | null): ProvidedLeadFields {
  const fields: ProvidedLeadFields = {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    journeyStage: data.journeyStage as JourneyStage,
    utmSource: data.utmSource || null,
    utmMedium: data.utmMedium || null,
    utmCampaign: data.utmCampaign || null,
    landingPage,
  };

  for (const field of OPTIONAL_TEXT_FIELDS) {
    const value = data[field];
    if (typeof value === 'string' && value.trim()) {
      fields[field] = value;
    }
  }

  if (data.desiredSupport && data.desiredSupport.length > 0) {
    fields.desiredSupport = data.desiredSupport;
  }

  return fields;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  // General abuse protection: cap submissions per IP.
  const rateLimit = checkRateLimit(`lead-submit:${ip}`, { windowMs: 10 * 60 * 1000, max: 8 });
  if (!rateLimit.allowed) {
    return jsonError('Too many submissions. Please try again shortly.', 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid request body', 400);
  }

  const parsed = leadSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Please check the form and try again.', 400, parsed.error.flatten());
  }

  const data = { ...parsed.data, email: parsed.data.email.toLowerCase() };

  // Honeypot + minimum-fill-time spam checks. Bots get a success-shaped
  // response (so they don't learn they were caught) without anything written.
  const honeypotTripped = Boolean(data.honeypot);
  const submittedTooFast =
    typeof data.formOpenedAt === 'number' && Date.now() - data.formOpenedAt < MIN_FORM_FILL_TIME_MS;
  if (honeypotTripped || submittedTooFast) {
    return jsonSuccess({ leadId: null, journeyStage: data.journeyStage });
  }

  // Prevent rapid duplicate submissions (e.g. accidental double-click) from
  // the same IP+email within a short window, independent of the general
  // per-IP rate limit above.
  const duplicateGuard = checkRateLimit(`lead-submit:${ip}:${data.email.toLowerCase()}`, {
    windowMs: 30 * 1000,
    max: 1,
  });
  if (!duplicateGuard.allowed) {
    return jsonSuccess({ leadId: null, journeyStage: data.journeyStage });
  }

  try {
    const [newLeadStage, websiteSource, existingLead] = await Promise.all([
      prisma.pipelineStage.findUnique({ where: { key: 'new_lead' } }),
      prisma.leadSource.findUnique({ where: { key: WEBSITE_LEAD_SOURCE_KEY } }),
      prisma.lead.findUnique({ where: { email: data.email } }),
    ]);

    const isNewLead = !existingLead;
    const landingPage = data.landingPage || request.headers.get('referer') || null;
    const providedFields = buildProvidedFields(data, landingPage);

    const newTags = generateLeadTags(data);
    const mergedTags = Array.from(new Set([...(existingLead?.tags ?? []), ...newTags])).slice(0, 12);

    const lead = await prisma.$transaction(async (tx) => {
      const savedLead = await tx.lead.upsert({
        where: { email: data.email },
        update: { ...providedFields, tags: mergedTags },
        create: {
          ...providedFields,
          email: data.email,
          tags: newTags,
          source: WEBSITE_LEAD_SOURCE_KEY,
          leadSourceId: websiteSource?.id,
          status: 'NEW',
          pipelineStageId: newLeadStage?.id,
        },
      });

      await tx.leadActivity.create({
        data: {
          leadId: savedLead.id,
          type: 'SUBMISSION',
          message: isNewLead
            ? 'Lead submitted the DSF Growth Assessment.'
            : 'New Growth Assessment submission received.',
        },
      });

      return savedLead;
    });

    await emitLeadEvent({
      type: isNewLead ? 'lead.created' : 'lead.duplicate_submission',
      leadId: lead.id,
      data: { email: lead.email, source: WEBSITE_LEAD_SOURCE_KEY, journeyStage: data.journeyStage },
    });

    return jsonSuccess({ leadId: lead.id, journeyStage: data.journeyStage });
  } catch (error) {
    return jsonError('Something went wrong submitting your request. Please try again.', 500, error);
  }
}
