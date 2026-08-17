import type { Lead } from '@prisma/client';
import { MONTHLY_LEAD_VOLUME_OPTIONS } from '@/lib/validation/lead';

export function volumeLabel(value: string | null): string | null {
  if (!value) return null;
  return MONTHLY_LEAD_VOLUME_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/**
 * A short, glanceable summary of "where this person is right now" — the
 * exact underlying field depends on which Growth Assessment branch they
 * went through. Distinct from the detailed Qualification Answers list below
 * it, which shows every answer they actually gave.
 */
export function currentSituationSummary(lead: Lead): string | null {
  switch (lead.journeyStage) {
    case 'ASPIRING_FOUNDER':
      return lead.businessIdeaStatus;
    case 'EARLY_STAGE': {
      const parts: string[] = [];
      if (lead.hasWebsite) parts.push(`Website: ${lead.hasWebsite}`);
      if (lead.hasCRM) parts.push(`CRM: ${lead.hasCRM}`);
      if (lead.hasCustomers) parts.push(`Customers: ${lead.hasCustomers}`);
      return parts.length > 0 ? parts.join(' · ') : null;
    }
    case 'GROWTH':
    case 'SYSTEMIZATION':
    case 'SCALING':
      return lead.currentLeadProcess;
    case 'UNSURE':
      return lead.message;
    default:
      return null;
  }
}

export interface DisplayField {
  label: string;
  value: string;
}

/**
 * Detailed qualification answers, filtered to only what this branch of the
 * assessment actually asked — never renders empty business fields for
 * someone who doesn't have a business yet.
 */
export function qualificationFields(lead: Lead): DisplayField[] {
  const fields: DisplayField[] = [];
  const add = (label: string, value: string | null | undefined) => {
    if (value) fields.push({ label, value });
  };

  switch (lead.journeyStage) {
    case 'ASPIRING_FOUNDER':
      add('Business Idea Status', lead.businessIdeaStatus);
      add('Skills & Experience', lead.skillsAndExperience);
      if (lead.desiredSupport.length > 0) add('Wants Help With', lead.desiredSupport.join(', '));
      break;
    case 'EARLY_STAGE':
      add('Industry / Niche', lead.industry);
      add('What They Currently Sell', lead.currentOffer);
      add('Has Website', lead.hasWebsite);
      add('Has CRM', lead.hasCRM);
      add('Has Customers', lead.hasCustomers);
      add('Customer Acquisition Sources', lead.customerAcquisitionSources);
      add('Primary Challenge', lead.primaryChallenge);
      break;
    case 'GROWTH':
    case 'SYSTEMIZATION':
    case 'SCALING':
      add('Industry', lead.industry);
      add('Monthly Enquiries', volumeLabel(lead.monthlyLeadVolume));
      add('Current Lead Process', lead.currentLeadProcess);
      add('Primary Challenge', lead.primaryChallenge);
      add('Would Make the Biggest Difference', lead.desiredOutcome);
      break;
    case 'UNSURE':
      // Current Situation already surfaces the message; nothing further to add.
      break;
    default:
      // Pre-Phase-4 lead with no journeyStage recorded — fall back to
      // whichever legacy fields happen to be populated.
      add('Industry', lead.industry);
      add('Monthly Enquiries', volumeLabel(lead.monthlyLeadVolume));
      add('Current Lead Process', lead.currentLeadProcess);
      add('Primary Challenge', lead.primaryChallenge);
      break;
  }

  return fields;
}
