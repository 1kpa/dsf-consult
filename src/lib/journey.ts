import type { JourneyStage } from '@prisma/client';

/**
 * Journey Stage describes where the CUSTOMER is in their business journey.
 * This is deliberately separate from PipelineStage, which describes where
 * the LEAD is in DSF's sales process (see prisma/schema.prisma and
 * src/lib/pipeline.ts). Never merge these two concepts.
 */
export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  ASPIRING_FOUNDER: 'Aspiring Founder',
  EARLY_STAGE: 'Early Stage',
  GROWTH: 'Growth',
  SYSTEMIZATION: 'Needs Systems',
  SCALING: 'Scaling',
  UNSURE: 'Unsure',
};

export const EXISTING_BUSINESS_JOURNEY_STAGES: JourneyStage[] = ['EARLY_STAGE', 'GROWTH', 'SYSTEMIZATION', 'SCALING'];

export function isExistingBusinessJourneyStage(stage: JourneyStage | null | undefined): boolean {
  return !!stage && EXISTING_BUSINESS_JOURNEY_STAGES.includes(stage);
}
