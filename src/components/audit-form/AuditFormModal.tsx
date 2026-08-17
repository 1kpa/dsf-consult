'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuditForm } from '@/context/AuditFormContext';
import { trackEvent } from '@/lib/analytics';
import {
  JOURNEY_STAGE_OPTIONS,
  INDUSTRY_OPTIONS,
  MONTHLY_LEAD_VOLUME_OPTIONS,
  CURRENT_LEAD_PROCESS_OPTIONS,
  PRIMARY_CHALLENGE_OPTIONS,
  DESIRED_OUTCOME_OPTIONS,
  BUSINESS_IDEA_STATUS_OPTIONS,
  DESIRED_SUPPORT_OPTIONS,
  PRIMARY_GOAL_OPTIONS,
  START_TIMELINE_OPTIONS,
  HAS_WEBSITE_OPTIONS,
  HAS_CRM_OPTIONS,
  HAS_CUSTOMERS_OPTIONS,
  EARLY_STAGE_CHALLENGE_OPTIONS,
  UNSURE_CLOSEST_OPTIONS,
  leadSubmissionSchema,
  type JourneyStageValue,
} from '@/lib/validation/lead';

// ---------------------------------------------------------------------------
// Form state
// ---------------------------------------------------------------------------

interface FormState {
  journeyStage: JourneyStageValue | '';
  businessIdeaStatus: string;
  skillsAndExperience: string;
  desiredSupport: string[];
  primaryGoal: string;
  startTimeline: string;
  businessName: string;
  industry: string;
  currentOffer: string;
  hasWebsite: string;
  hasCRM: string;
  hasCustomers: string;
  customerAcquisitionSources: string;
  monthlyLeadVolume: string;
  currentLeadProcess: string;
  primaryChallenge: string;
  desiredOutcome: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  companyWebsite: string; // honeypot — real users never see or fill this
}

const INITIAL_STATE: FormState = {
  journeyStage: '',
  businessIdeaStatus: '',
  skillsAndExperience: '',
  desiredSupport: [],
  primaryGoal: '',
  startTimeline: '',
  businessName: '',
  industry: '',
  currentOffer: '',
  hasWebsite: '',
  hasCRM: '',
  hasCustomers: '',
  customerAcquisitionSources: '',
  monthlyLeadVolume: '',
  currentLeadProcess: '',
  primaryChallenge: '',
  desiredOutcome: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  companyWebsite: '',
};

type OptionFieldKey = 'businessIdeaStatus' | 'primaryGoal' | 'startTimeline' | 'industry' | 'hasWebsite' | 'hasCRM' | 'hasCustomers' | 'monthlyLeadVolume' | 'currentLeadProcess' | 'primaryChallenge' | 'desiredOutcome';
type TextFieldKey = 'skillsAndExperience' | 'businessName' | 'currentOffer' | 'customerAcquisitionSources' | 'message';
type ContactFieldKey = 'firstName' | 'lastName' | 'businessName' | 'email' | 'phone' | 'message';

type StepDef =
  | { kind: 'journey' }
  | { kind: 'options'; field: OptionFieldKey; title: string; subtitle?: string; options: { value: string; label: string }[]; optional?: boolean }
  | { kind: 'multi-options'; field: 'desiredSupport'; title: string; subtitle?: string; options: { value: string; label: string }[] }
  | { kind: 'text'; field: TextFieldKey; title: string; subtitle?: string; placeholder?: string; multiline?: boolean; optional?: boolean }
  | { kind: 'contact'; title: string; subtitle?: string; fields: ContactFieldKey[]; optionalFields?: ContactFieldKey[] };

const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

const ASPIRING_FOUNDER_STEPS: StepDef[] = [
  { kind: 'options', field: 'businessIdeaStatus', title: 'Do you already have a business idea?', options: asOptions(BUSINESS_IDEA_STATUS_OPTIONS) },
  {
    kind: 'text',
    field: 'skillsAndExperience',
    title: 'What skills, experience or interests would you potentially like to build around?',
    placeholder: 'e.g. 10 years in nursing, love photography, background in sales…',
    multiline: true,
  },
  {
    kind: 'multi-options',
    field: 'desiredSupport',
    title: 'What would you most like help with?',
    subtitle: 'Select all that apply.',
    options: asOptions(DESIRED_SUPPORT_OPTIONS),
  },
  { kind: 'options', field: 'primaryGoal', title: 'What is your primary goal?', options: asOptions(PRIMARY_GOAL_OPTIONS) },
  { kind: 'options', field: 'startTimeline', title: 'How soon would you like to start?', options: asOptions(START_TIMELINE_OPTIONS) },
  {
    kind: 'contact',
    title: 'Almost there — how can we reach you?',
    fields: ['firstName', 'lastName', 'email', 'phone', 'message'],
    optionalFields: ['message'],
  },
];

const EARLY_STAGE_STEPS: StepDef[] = [
  {
    kind: 'text',
    field: 'businessName',
    title: "What's your business called?",
    subtitle: "Optional — skip if you haven't settled on a name yet.",
    optional: true,
  },
  { kind: 'options', field: 'industry', title: 'What industry or niche are you in?', options: asOptions(INDUSTRY_OPTIONS) },
  {
    kind: 'text',
    field: 'currentOffer',
    title: 'What do you currently sell?',
    placeholder: 'e.g. Freelance logo design for small businesses',
  },
  { kind: 'options', field: 'hasWebsite', title: 'Do you currently have a website?', options: asOptions(HAS_WEBSITE_OPTIONS) },
  { kind: 'options', field: 'hasCRM', title: 'Do you currently have a CRM?', options: asOptions(HAS_CRM_OPTIONS) },
  { kind: 'options', field: 'hasCustomers', title: 'Have you acquired any customers yet?', options: asOptions(HAS_CUSTOMERS_OPTIONS) },
  {
    kind: 'text',
    field: 'customerAcquisitionSources',
    title: 'Where do customers currently come from?',
    placeholder: 'e.g. referrals, Instagram, word of mouth…',
  },
  { kind: 'options', field: 'primaryChallenge', title: "What's your biggest challenge?", options: asOptions(EARLY_STAGE_CHALLENGE_OPTIONS) },
  {
    kind: 'contact',
    title: 'How can we reach you?',
    fields: ['firstName', 'lastName', 'email', 'phone', 'message'],
    optionalFields: ['message'],
  },
];

const EXISTING_BUSINESS_STEPS: StepDef[] = [
  { kind: 'contact', title: "Let's start with the basics", fields: ['firstName', 'lastName', 'businessName'] },
  { kind: 'contact', title: 'How can we reach you?', fields: ['email', 'phone'] },
  { kind: 'options', field: 'industry', title: 'What industry are you in?', options: asOptions(INDUSTRY_OPTIONS) },
  {
    kind: 'options',
    field: 'monthlyLeadVolume',
    title: 'How many new enquiries does your business typically receive each month?',
    options: MONTHLY_LEAD_VOLUME_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    kind: 'options',
    field: 'currentLeadProcess',
    title: 'What currently happens when a new lead contacts your business?',
    options: asOptions(CURRENT_LEAD_PROCESS_OPTIONS),
  },
  { kind: 'options', field: 'primaryChallenge', title: "What's your biggest challenge?", options: asOptions(PRIMARY_CHALLENGE_OPTIONS) },
  {
    kind: 'options',
    field: 'desiredOutcome',
    title: 'What would make the biggest difference to your business right now?',
    options: asOptions(DESIRED_OUTCOME_OPTIONS),
  },
  { kind: 'text', field: 'message', title: 'Anything else we should know?', subtitle: 'Optional.', multiline: true, optional: true },
];

const UNSURE_STEPS: StepDef[] = [
  { kind: 'text', field: 'message', title: "Tell us what you're trying to accomplish.", multiline: true },
  { kind: 'options', field: 'primaryGoal', title: 'Which sounds closest to you?', options: asOptions(UNSURE_CLOSEST_OPTIONS) },
  { kind: 'contact', title: 'How can we reach you?', fields: ['firstName', 'lastName', 'email', 'phone'] },
];

function getBranchSteps(journeyStage: JourneyStageValue): StepDef[] {
  switch (journeyStage) {
    case 'ASPIRING_FOUNDER':
      return ASPIRING_FOUNDER_STEPS;
    case 'EARLY_STAGE':
      return EARLY_STAGE_STEPS;
    case 'GROWTH':
    case 'SYSTEMIZATION':
    case 'SCALING':
      return EXISTING_BUSINESS_STEPS;
    case 'UNSURE':
      return UNSURE_STEPS;
    default:
      return [];
  }
}

function finalCtaLabel(journeyStage: JourneyStageValue | ''): string {
  if (journeyStage === 'ASPIRING_FOUNDER') return 'Show Me My Next Step';
  if (journeyStage === 'UNSURE') return 'Help Me Find My Next Step';
  return 'Request My Free Systems Audit';
}

function successContent(journeyStage: JourneyStageValue | ''): { heading: string; body: string; cta: string } {
  if (journeyStage === 'ASPIRING_FOUNDER') {
    return {
      heading: "You've taken the first step.",
      body: "We'll review where you're starting, what you want to build and the systems you'll need to turn it into a real business.",
      cta: 'Book My Strategy Call',
    };
  }
  if (journeyStage === 'UNSURE') {
    return {
      heading: "We'll help you identify the next step.",
      body: "We'll review your answers and help determine the most practical path based on where you are today.",
      cta: 'Speak With DSF Consult',
    };
  }
  return {
    heading: 'Your assessment is in.',
    body: "We'll review how your business currently attracts, manages and converts opportunities and identify where a stronger system could improve growth.",
    cta: 'Book My Systems Review',
  };
}

// ---------------------------------------------------------------------------
// Validation (client-side UX guard — the server independently re-validates
// everything via lib/validation/lead.ts before writing to the database)
// ---------------------------------------------------------------------------

function validateStep(step: StepDef, data: FormState): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step.kind === 'journey') {
    if (!data.journeyStage) errors.journeyStage = 'Select an option';
  } else if (step.kind === 'options') {
    if (!data[step.field] && !step.optional) errors[step.field] = 'Select an option';
  } else if (step.kind === 'multi-options') {
    if (data[step.field].length === 0) errors[step.field] = 'Select at least one option';
  } else if (step.kind === 'text') {
    if (!data[step.field].trim() && !step.optional) errors[step.field] = 'This field is required';
  } else if (step.kind === 'contact') {
    for (const field of step.fields) {
      if (step.optionalFields?.includes(field)) continue;
      if (field === 'email') {
        const result = leadSubmissionSchema.shape.email.safeParse(data.email);
        if (!result.success) errors.email = result.error.issues[0]?.message || 'Enter a valid email';
      } else if (field === 'phone') {
        const result = leadSubmissionSchema.shape.phone.safeParse(data.phone);
        if (!result.success) errors.phone = result.error.issues[0]?.message || 'Enter a valid phone number';
      } else if (!data[field].trim()) {
        errors[field] = 'This field is required';
      }
    }
  }

  return errors;
}

type Status = 'form' | 'submitting' | 'success' | 'error';

export function AuditFormModal() {
  const { isOpen, close, presetJourneyStage } = useAuditForm();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openedAtRef = useRef<number | null>(null);
  const startTrackedRef = useRef(false);
  const lastPresetAppliedRef = useRef<JourneyStageValue | null>(null);
  const attributionRef = useRef({ utmSource: '', utmMedium: '', utmCampaign: '', landingPage: '' });
  const dialogRef = useRef<HTMLDivElement>(null);

  const branchSteps = data.journeyStage ? getBranchSteps(data.journeyStage) : [];
  const steps: StepDef[] = [{ kind: 'journey' }, ...branchSteps];
  const totalSteps = steps.length;
  const currentStepDef = steps[Math.min(step, steps.length - 1)];

  useEffect(() => {
    if (!isOpen) return;

    openedAtRef.current = Date.now();
    if (!startTrackedRef.current) {
      trackEvent('systems_audit_started');
      startTrackedRef.current = true;
    }

    const params = new URLSearchParams(window.location.search);
    attributionRef.current = {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || '',
      landingPage: window.location.pathname,
    };

    if (presetJourneyStage && lastPresetAppliedRef.current !== presetJourneyStage) {
      lastPresetAppliedRef.current = presetJourneyStage;
      setData((prev) => ({ ...INITIAL_STATE, journeyStage: presetJourneyStage, firstName: prev.firstName, lastName: prev.lastName, email: prev.email, phone: prev.phone }));
      setFieldErrors({});
      setStep(1);
    }

    dialogRef.current?.focus();
  }, [isOpen, presetJourneyStage]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') close();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function selectJourneyStage(value: JourneyStageValue) {
    setData((prev) => ({
      ...INITIAL_STATE,
      journeyStage: value,
      firstName: prev.firstName,
      lastName: prev.lastName,
      email: prev.email,
      phone: prev.phone,
    }));
    setFieldErrors({});
  }

  function toggleDesiredSupport(value: string) {
    setData((prev) => ({
      ...prev,
      desiredSupport: prev.desiredSupport.includes(value)
        ? prev.desiredSupport.filter((v) => v !== value)
        : [...prev.desiredSupport, value],
    }));
    setFieldErrors((prev) => ({ ...prev, desiredSupport: '' }));
  }

  function goNext() {
    const errors = validateStep(currentStepDef, data);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    trackEvent('systems_audit_step_completed', { step: step + 1 });
    setStep((s) => Math.min(totalSteps - 1, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  function handleClose() {
    close();
    if (status === 'success') {
      setStep(0);
      setData(INITIAL_STATE);
      setStatus('form');
      startTrackedRef.current = false;
      lastPresetAppliedRef.current = null;
    }
  }

  async function handleSubmit() {
    setStatus('submitting');
    setErrorMessage(null);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journeyStage: data.journeyStage,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          message: data.message,
          businessName: data.businessName,
          industry: data.industry,
          monthlyLeadVolume: data.monthlyLeadVolume,
          currentLeadProcess: data.currentLeadProcess,
          primaryChallenge: data.primaryChallenge,
          desiredOutcome: data.desiredOutcome,
          businessIdeaStatus: data.businessIdeaStatus,
          skillsAndExperience: data.skillsAndExperience,
          desiredSupport: data.desiredSupport,
          primaryGoal: data.primaryGoal,
          startTimeline: data.startTimeline,
          currentOffer: data.currentOffer,
          hasWebsite: data.hasWebsite,
          hasCRM: data.hasCRM,
          hasCustomers: data.hasCustomers,
          customerAcquisitionSources: data.customerAcquisitionSources,
          honeypot: data.companyWebsite,
          formOpenedAt: openedAtRef.current,
          ...attributionRef.current,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }
      trackEvent('systems_audit_submitted', { journeyStage: data.journeyStage });
      setStatus('success');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }

  const isLastStep = step === totalSteps - 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="DSF Growth Assessment"
            tabIndex={-1}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-6 shadow-2xl focus:outline-none sm:p-8"
            style={{ backgroundColor: '#0d0d10' }}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>

            {status === 'success' ? (
              <SuccessState journeyStage={data.journeyStage} onClose={handleClose} />
            ) : (
              <>
                <div className="mb-6 pr-8">
                  <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>
                      Step {step + 1} of {totalSteps}
                    </span>
                    <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-600"
                      animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StepContent
                      stepDef={currentStepDef}
                      data={data}
                      fieldErrors={fieldErrors}
                      updateField={updateField}
                      selectJourneyStage={selectJourneyStage}
                      toggleDesiredSupport={toggleDesiredSupport}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Honeypot field — visually hidden, never shown or filled by real visitors */}
                <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                  <label htmlFor="company_website">Website</label>
                  <input
                    id="company_website"
                    name="company_website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.companyWebsite}
                    onChange={(e) => updateField('companyWebsite', e.target.value)}
                  />
                </div>

                {status === 'error' && errorMessage && <p className="mt-4 text-sm text-rose-300">{errorMessage}</p>}

                <div className="mt-8 flex items-center justify-between gap-3">
                  {step > 0 ? (
                    <button
                      onClick={goBack}
                      className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white"
                    >
                      Back
                    </button>
                  ) : (
                    <span />
                  )}

                  {!isLastStep ? (
                    <button
                      onClick={goNext}
                      className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={status === 'submitting'}
                      className="rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 disabled:opacity-60"
                    >
                      {status === 'submitting' ? 'Submitting…' : finalCtaLabel(data.journeyStage)}
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------------------
// Step renderer
// ---------------------------------------------------------------------------

interface StepContentProps {
  stepDef: StepDef;
  data: FormState;
  fieldErrors: Record<string, string>;
  updateField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  selectJourneyStage: (value: JourneyStageValue) => void;
  toggleDesiredSupport: (value: string) => void;
}

function StepContent({ stepDef, data, fieldErrors, updateField, selectJourneyStage, toggleDesiredSupport }: StepContentProps) {
  if (stepDef.kind === 'journey') {
    return (
      <div className="space-y-4">
        <StepHeading title="Where are you right now?" />
        <OptionGrid
          options={JOURNEY_STAGE_OPTIONS}
          value={data.journeyStage}
          error={fieldErrors.journeyStage}
          onChange={(v) => selectJourneyStage(v as JourneyStageValue)}
        />
      </div>
    );
  }

  if (stepDef.kind === 'options') {
    return (
      <div className="space-y-4">
        <StepHeading title={stepDef.title} subtitle={stepDef.subtitle} />
        <OptionGrid
          options={stepDef.options}
          value={data[stepDef.field]}
          error={fieldErrors[stepDef.field]}
          onChange={(v) => updateField(stepDef.field, v)}
        />
      </div>
    );
  }

  if (stepDef.kind === 'multi-options') {
    return (
      <div className="space-y-4">
        <StepHeading title={stepDef.title} subtitle={stepDef.subtitle} />
        <OptionGrid
          options={stepDef.options}
          value={data.desiredSupport}
          error={fieldErrors.desiredSupport}
          onChange={toggleDesiredSupport}
          multi
        />
      </div>
    );
  }

  if (stepDef.kind === 'text') {
    return (
      <div className="space-y-4">
        <StepHeading title={stepDef.title} subtitle={stepDef.subtitle} />
        {stepDef.multiline ? (
          <textarea
            value={data[stepDef.field]}
            onChange={(e) => updateField(stepDef.field, e.target.value)}
            rows={4}
            placeholder={stepDef.placeholder}
            autoFocus
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
              fieldErrors[stepDef.field] ? 'border-rose-400 focus:ring-rose-400' : 'border-white/10 focus:border-sky-400 focus:ring-sky-400'
            }`}
          />
        ) : (
          <input
            type="text"
            value={data[stepDef.field]}
            onChange={(e) => updateField(stepDef.field, e.target.value)}
            placeholder={stepDef.placeholder}
            autoFocus
            className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
              fieldErrors[stepDef.field] ? 'border-rose-400 focus:ring-rose-400' : 'border-white/10 focus:border-sky-400 focus:ring-sky-400'
            }`}
          />
        )}
        {fieldErrors[stepDef.field] && <p className="text-xs text-rose-300">{fieldErrors[stepDef.field]}</p>}
      </div>
    );
  }

  // contact
  return (
    <div className="space-y-4">
      <StepHeading title={stepDef.title} subtitle={stepDef.subtitle} />
      {stepDef.fields.includes('firstName') && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="First Name" value={data.firstName} error={fieldErrors.firstName} onChange={(v) => updateField('firstName', v)} autoFocus />
          <TextField label="Last Name" value={data.lastName} error={fieldErrors.lastName} onChange={(v) => updateField('lastName', v)} />
        </div>
      )}
      {stepDef.fields.includes('businessName') && (
        <TextField
          label={stepDef.optionalFields?.includes('businessName') ? 'Business Name (optional)' : 'Business Name'}
          value={data.businessName}
          error={fieldErrors.businessName}
          onChange={(v) => updateField('businessName', v)}
          autoFocus={!stepDef.fields.includes('firstName')}
        />
      )}
      {(stepDef.fields.includes('email') || stepDef.fields.includes('phone')) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stepDef.fields.includes('email') && (
            <TextField
              label="Email"
              type="email"
              value={data.email}
              error={fieldErrors.email}
              onChange={(v) => updateField('email', v)}
              autoFocus={!stepDef.fields.includes('firstName') && !stepDef.fields.includes('businessName')}
            />
          )}
          {stepDef.fields.includes('phone') && (
            <TextField label="Phone" type="tel" value={data.phone} error={fieldErrors.phone} onChange={(v) => updateField('phone', v)} />
          )}
        </div>
      )}
      {stepDef.fields.includes('message') && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">Message (optional)</label>
          <textarea
            value={data.message}
            onChange={(e) => updateField('message', e.target.value)}
            rows={3}
            placeholder="Anything else we should know?"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
        </div>
      )}
    </div>
  );
}

function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white sm:text-xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoFocus?: boolean;
}

function TextField({ label, value, onChange, error, type = 'text', autoFocus }: TextFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        className={`w-full rounded-lg border bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 ${
          error ? 'border-rose-400 focus:ring-rose-400' : 'border-white/10 focus:border-sky-400 focus:ring-sky-400'
        }`}
      />
      {error && <p className="mt-1 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

interface OptionGridProps {
  options: { value: string; label: string }[];
  value: string | string[];
  onChange: (value: string) => void;
  error?: string;
  multi?: boolean;
}

function OptionGrid({ options, value, onChange, error, multi }: OptionGridProps) {
  const isSelected = (optionValue: string) => (multi ? (value as string[]).includes(optionValue) : value === optionValue);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const selected = isSelected(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              className={`rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors ${
                selected
                  ? 'border-sky-400 bg-sky-500/15 text-sky-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}

function SuccessState({ journeyStage, onClose }: { journeyStage: JourneyStageValue | ''; onClose: () => void }) {
  const content = successContent(journeyStage);

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-300">
        ✓
      </div>
      <h2 className="text-xl font-bold text-white">{content.heading}</h2>
      <p className="mt-3 text-slate-300">{content.body}</p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <a
          href="/book"
          onClick={() => trackEvent('booking_clicked', { source: 'audit_form_success', journeyStage: journeyStage || undefined })}
          className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-sky-500/30 sm:w-auto"
        >
          {content.cta}
        </a>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
          Close
        </button>
      </div>
    </div>
  );
}
