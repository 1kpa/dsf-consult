import type { LeadSubmissionInput } from '@/lib/validation/lead';

/**
 * Derives a small set of sales-conversation tags from a Growth Assessment
 * submission. Deliberately conservative — these exist to help a rep scan a
 * lead in seconds, not to catalogue every answer. Capped and deduped.
 */
export function generateLeadTags(data: LeadSubmissionInput): string[] {
  const tags = new Set<string>();

  // START / SYSTEMIZE / SCALE methodology bucket
  switch (data.journeyStage) {
    case 'ASPIRING_FOUNDER':
    case 'EARLY_STAGE':
      tags.add('START');
      break;
    case 'SYSTEMIZATION':
      tags.add('SYSTEMIZE');
      break;
    case 'GROWTH':
    case 'SCALING':
      tags.add('SCALE');
      break;
    default:
      break;
  }

  // Journey bucket
  if (data.journeyStage === 'ASPIRING_FOUNDER') {
    tags.add('ASPIRING FOUNDER');
  } else if (data.journeyStage !== 'UNSURE') {
    tags.add('EXISTING BUSINESS');
  }

  // Need signals — aspiring founder (from multi-select desired support)
  const desiredSupport = data.desiredSupport ?? [];
  if (desiredSupport.includes('Creating my website')) tags.add('NEEDS WEBSITE');
  if (desiredSupport.includes('Setting up a CRM')) tags.add('NEEDS CRM');
  if (desiredSupport.includes('Finding clients') || desiredSupport.includes('Learning client acquisition')) {
    tags.add('NEEDS CLIENT ACQUISITION');
  }
  if (desiredSupport.includes('Automating the business')) tags.add('NEEDS AUTOMATION');

  // Need signals — early stage
  if (data.hasWebsite === 'No') tags.add('NEEDS WEBSITE');
  if (data.hasCRM === 'No') tags.add('NEEDS CRM');
  if (data.hasCustomers === 'No') tags.add('NEEDS CLIENT ACQUISITION');

  // Need signals — existing business
  if (data.currentLeadProcess === 'Someone calls manually' || data.currentLeadProcess === 'Someone texts manually') {
    tags.add('NEEDS CRM');
  }
  if (data.primaryChallenge === 'Getting enough leads') tags.add('NEEDS CLIENT ACQUISITION');
  if (data.primaryChallenge === 'Following up consistently') tags.add('NEEDS FOLLOW-UP');
  if (data.desiredOutcome === 'More automation' || data.desiredOutcome === 'Complete system rebuild') {
    tags.add('NEEDS AUTOMATION');
  }
  if (data.monthlyLeadVolume === '101-300' || data.monthlyLeadVolume === '300+') {
    tags.add('HIGH LEAD VOLUME');
  }

  return Array.from(tags).slice(0, 8);
}
