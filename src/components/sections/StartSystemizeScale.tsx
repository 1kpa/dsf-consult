'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuditForm } from '@/context/AuditFormContext';
import type { JourneyStageValue } from '@/lib/validation/lead';

interface FrameworkStage {
  key: string;
  title: string;
  description: string;
  includes: string[];
  cta: string;
  journeyStage: JourneyStageValue;
  accent: string;
}

const STAGES: FrameworkStage[] = [
  {
    key: 'start',
    title: 'START',
    description: 'Turn your skills, experience or idea into a structured business.',
    includes: [
      'Niche Identification',
      'Offer Development',
      'Business Positioning',
      'Brand Foundation',
      'Website / Landing Page',
      'CRM Foundation',
      'Client Acquisition Setup',
      'Launch System',
    ],
    cta: 'Help Me Start',
    journeyStage: 'ASPIRING_FOUNDER',
    accent: 'violet',
  },
  {
    key: 'systemize',
    title: 'SYSTEMIZE',
    description: 'Build the infrastructure that keeps opportunities from falling through the cracks.',
    includes: [
      'Lead Capture',
      'CRM',
      'AI Reception',
      'Automated Follow-Up',
      'Appointment Workflows',
      'Lead Reactivation',
      'Review Systems',
      'Reporting',
    ],
    cta: 'Systemize My Business',
    journeyStage: 'SYSTEMIZATION',
    accent: 'sky',
  },
  {
    key: 'scale',
    title: 'SCALE',
    description: 'Build predictable systems for generating and converting more opportunities.',
    includes: [
      'Client Acquisition',
      'Campaign Infrastructure',
      'Sales Pipeline',
      'Follow-Up Optimization',
      'Lead Reactivation',
      'Conversion Systems',
      'Automation',
      'Performance Tracking',
    ],
    cta: 'Help Me Scale',
    journeyStage: 'SCALING',
    accent: 'emerald',
  },
];

const ACCENT_STYLES: Record<string, { border: string; text: string; dot: string }> = {
  violet: { border: 'border-violet-400/20 hover:border-violet-400/40', text: 'text-violet-300', dot: 'bg-violet-400' },
  sky: { border: 'border-sky-400/20 hover:border-sky-400/40', text: 'text-sky-300', dot: 'bg-sky-400' },
  emerald: { border: 'border-emerald-400/20 hover:border-emerald-400/40', text: 'text-emerald-300', dot: 'bg-emerald-400' },
};

export function StartSystemizeScaleSection() {
  const { open } = useAuditForm();

  return (
    <section id="start" className="relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">START. SYSTEMIZE. SCALE.</h2>
          <p className="mt-4 text-slate-300">
            DSF Consult helps entrepreneurs and businesses build the systems behind sustainable growth.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {STAGES.map((stage, idx) => {
            const accent = ACCENT_STYLES[stage.accent];
            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`flex flex-col rounded-3xl border bg-white/[0.02] p-8 transition-colors ${accent.border}`}
              >
                <div className={`text-sm font-bold uppercase tracking-widest ${accent.text}`}>{stage.title}</div>
                <p className="mt-3 text-slate-300">{stage.description}</p>
                <ul className="mt-6 flex-1 space-y-2">
                  {stage.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${accent.dot}`} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Button onClick={() => open(stage.journeyStage)} className="w-full">
                    {stage.cta}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-slate-500">
          These aren&apos;t rigid packages or fixed pricing — they&apos;re stages of your journey. You can
          enter DSF Consult at any stage.
        </p>
      </div>
    </section>
  );
}
