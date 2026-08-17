import { z } from 'zod';

// ---------------------------------------------------------------------------
// Question 1 — journey stage. Drives which branch of the assessment follows.
// ---------------------------------------------------------------------------

export const JOURNEY_STAGE_VALUES = [
  'ASPIRING_FOUNDER',
  'EARLY_STAGE',
  'GROWTH',
  'SYSTEMIZATION',
  'SCALING',
  'UNSURE',
] as const;

export type JourneyStageValue = (typeof JOURNEY_STAGE_VALUES)[number];

export const JOURNEY_STAGE_OPTIONS: { value: JourneyStageValue; label: string }[] = [
  { value: 'ASPIRING_FOUNDER', label: 'I want to start a business' },
  { value: 'EARLY_STAGE', label: 'I recently started a business' },
  { value: 'GROWTH', label: 'I have an established business and want more customers' },
  { value: 'SYSTEMIZATION', label: 'I have a business and need better systems / automation' },
  { value: 'SCALING', label: 'I want to scale an existing business' },
  { value: 'UNSURE', label: "I'm not sure what I need yet" },
];

export const EXISTING_BUSINESS_STAGES: JourneyStageValue[] = ['GROWTH', 'SYSTEMIZATION', 'SCALING'];

// ---------------------------------------------------------------------------
// Existing-business branch (Growth / Systemization / Scaling) — the original
// Phase 3 qualification questions, preserved as-is, plus one new question.
// ---------------------------------------------------------------------------

export const INDUSTRY_OPTIONS = [
  'Dental',
  'Medical',
  'Legal',
  'Cleaning',
  'HVAC',
  'Contractor',
  'Real Estate',
  'Education',
  'Beauty',
  'Professional Services',
  'Other',
] as const;

export const MONTHLY_LEAD_VOLUME_OPTIONS = [
  { value: '0-10', label: '0–10' },
  { value: '11-30', label: '11–30' },
  { value: '31-100', label: '31–100' },
  { value: '101-300', label: '101–300' },
  { value: '300+', label: '300+' },
] as const;

export const CURRENT_LEAD_PROCESS_OPTIONS = [
  'Someone calls manually',
  'Someone texts manually',
  'We use a CRM',
  'We already have automation',
  'It depends',
  "I'm not sure",
] as const;

export const PRIMARY_CHALLENGE_OPTIONS = [
  'Getting enough leads',
  'Responding quickly',
  'Following up consistently',
  'Booking appointments',
  'Managing leads',
  'Reactivating old leads',
  'Tracking performance',
  'Everything feels disconnected',
] as const;

export const DESIRED_OUTCOME_OPTIONS = [
  'More qualified leads',
  'Faster response',
  'More appointments',
  'Better follow-up',
  'Better CRM',
  'Reactivating old leads',
  'More automation',
  'Better sales visibility',
  'Complete system rebuild',
] as const;

// ---------------------------------------------------------------------------
// Aspiring-founder branch
// ---------------------------------------------------------------------------

export const BUSINESS_IDEA_STATUS_OPTIONS = [
  'Yes — I know what I want to build',
  'I have several ideas',
  "I have skills but don't know what business to start",
  "I'm completely starting from scratch",
] as const;

export const DESIRED_SUPPORT_OPTIONS = [
  'Finding the right niche',
  'Choosing a business idea',
  'Creating my offer',
  'Building my brand',
  'Creating my website',
  'Setting up a CRM',
  'Finding clients',
  'Learning client acquisition',
  'Automating the business',
  'Setting up the complete business system',
  "I'm not sure yet",
] as const;

export const PRIMARY_GOAL_OPTIONS = [
  'Build a side income',
  'Replace my job income',
  'Build a full-time business',
  'Build an agency/service business',
  'Create an online business',
  'Build something I can eventually scale',
  "I'm still exploring",
] as const;

export const START_TIMELINE_OPTIONS = ['Immediately', 'Within 30 days', 'Within 3 months', 'Just researching for now'] as const;

// ---------------------------------------------------------------------------
// Early-stage branch
// ---------------------------------------------------------------------------

export const HAS_WEBSITE_OPTIONS = ['Yes', 'No', 'In Progress'] as const;
export const HAS_CRM_OPTIONS = ['Yes', 'No', 'Not Sure'] as const;
export const HAS_CUSTOMERS_OPTIONS = ['Yes', 'No', 'A Few'] as const;

export const EARLY_STAGE_CHALLENGE_OPTIONS = [
  'Clarifying my offer',
  'Finding customers',
  'Building my website',
  'Setting up systems',
  'Following up with leads',
  'Pricing my services',
  'Automation',
  'Knowing what to do next',
] as const;

// ---------------------------------------------------------------------------
// Unsure branch — answers are stored on the shared `message` (goal) and
// `primaryGoal` (closest option) fields rather than dedicated columns.
// ---------------------------------------------------------------------------

export const UNSURE_CLOSEST_OPTIONS = [
  'I want to make money from my skills',
  'I want to start something online',
  'I already have customers but need structure',
  'I need more customers',
  'My business feels disorganized',
  'I want to use AI/automation',
  "I'm exploring my options",
] as const;

// Permissive on purpose: accepts international formats (+, spaces, dashes,
// parentheses) without pulling in a full phone-number-parsing dependency.
const PHONE_REGEX = /^[+]?[0-9\s\-().]{7,20}$/;

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const leadSubmissionSchema = z
  .object({
    journeyStage: z.enum(JOURNEY_STAGE_VALUES, { message: 'Select where you are in your business journey' }),

    firstName: z.string().trim().min(1, 'First name is required').max(100),
    lastName: z.string().trim().min(1, 'Last name is required').max(100),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address').max(200),
    phone: z.string().trim().min(1, 'Phone number is required').regex(PHONE_REGEX, 'Enter a valid phone number'),
    message: optionalText(2000),

    // Business identity — optional at the schema level; required per-branch below.
    businessName: optionalText(200),
    industry: optionalText(100),
    monthlyLeadVolume: optionalText(50),
    currentLeadProcess: optionalText(200),
    primaryChallenge: optionalText(200),
    desiredOutcome: optionalText(200),

    // Aspiring-founder branch
    businessIdeaStatus: optionalText(200),
    skillsAndExperience: optionalText(2000),
    desiredSupport: z.array(z.string().max(200)).max(20).optional(),
    primaryGoal: optionalText(200),
    startTimeline: optionalText(100),

    // Early-stage branch
    currentOffer: optionalText(1000),
    hasWebsite: optionalText(50),
    hasCRM: optionalText(50),
    hasCustomers: optionalText(50),
    customerAcquisitionSources: optionalText(1000),

    // Spam protection (see lib/rate-limit.ts for the request-rate side). Any
    // non-empty value here is a bot filling in a field real visitors never
    // see — deliberately NOT constrained to empty at the schema level, so a
    // filled honeypot still passes validation and gets a normal-looking
    // success response instead of a tell-tale 400.
    honeypot: z.string().max(500).optional().or(z.literal('')),
    formOpenedAt: z.number().optional(),

    // Attribution metadata, captured client-side when available.
    utmSource: optionalText(200),
    utmMedium: optionalText(200),
    utmCampaign: optionalText(200),
    landingPage: optionalText(500),
  })
  .superRefine((data, ctx) => {
    const require = (field: keyof typeof data, message: string) => {
      const value = data[field];
      const isEmpty = value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
      if (isEmpty) ctx.addIssue({ code: 'custom', path: [field], message });
    };

    if (data.journeyStage === 'ASPIRING_FOUNDER') {
      require('businessIdeaStatus', 'Select an option');
      require('skillsAndExperience', 'Tell us a bit about your skills or experience');
      require('desiredSupport', 'Select at least one option');
      require('primaryGoal', 'Select an option');
      require('startTimeline', 'Select an option');
    } else if (data.journeyStage === 'EARLY_STAGE') {
      require('industry', 'Select an industry or niche');
      require('currentOffer', 'Tell us what you currently sell');
      require('hasWebsite', 'Select an option');
      require('hasCRM', 'Select an option');
      require('hasCustomers', 'Select an option');
      require('customerAcquisitionSources', 'Tell us where customers currently come from');
      require('primaryChallenge', 'Select your biggest challenge');
    } else if (data.journeyStage === 'GROWTH' || data.journeyStage === 'SYSTEMIZATION' || data.journeyStage === 'SCALING') {
      require('businessName', 'Business name is required');
      require('industry', 'Select an industry');
      require('monthlyLeadVolume', 'Select your monthly enquiry volume');
      require('currentLeadProcess', 'Select what currently happens with new leads');
      require('primaryChallenge', 'Select your biggest challenge');
      require('desiredOutcome', 'Select what would make the biggest difference');
    } else if (data.journeyStage === 'UNSURE') {
      require('message', "Tell us what you're trying to accomplish");
      require('primaryGoal', 'Select the option closest to you');
    }
  });

export type LeadSubmissionInput = z.infer<typeof leadSubmissionSchema>;

export const MIN_FORM_FILL_TIME_MS = 1500;
