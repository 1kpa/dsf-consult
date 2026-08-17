'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuditForm } from '@/context/AuditFormContext';

const STEPS: { title: string; description: string }[] = [
  { title: 'WHAT DO I SELL?', description: 'We help you translate your skills or experience into something sellable.' },
  { title: 'NICHE', description: 'We help you find a specific, focused market to serve.' },
  { title: 'OFFER', description: 'We help you package your service into a clear, priced offer.' },
  { title: 'BRAND', description: 'We build the identity that makes your business feel real.' },
  { title: 'WEBSITE', description: 'We build the site that represents your business online.' },
  { title: 'CLIENT ACQUISITION', description: 'We set up the systems that bring in your first customers.' },
  { title: 'CRM', description: 'We build the system that tracks every lead and client.' },
  { title: 'AUTOMATION', description: 'We automate follow-up so nothing falls through the cracks.' },
  { title: 'CUSTOMERS', description: 'Real people, paying for what you built.' },
  { title: 'SCALE', description: 'We help you grow what starts working.' },
];

export function StartingFromZeroSection() {
  const { open } = useAuditForm();

  return (
    <section className="relative py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold text-white md:text-4xl"
        >
          YOU DON&apos;T NEED TO HAVE EVERYTHING FIGURED OUT TO START.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-slate-300"
        >
          We help you turn what you know into a structured business with an offer, digital presence and
          system for finding and serving customers.
        </motion.p>
      </div>

      <div className="mx-auto mt-12 max-w-md px-6 md:mt-16">
        <div className="flex flex-col items-stretch">
          {STEPS.map((step, idx) => (
            <div key={step.title}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (idx % 5) * 0.06 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center"
              >
                <div className="text-sm font-bold uppercase tracking-wide text-sky-300">{step.title}</div>
                <div className="mt-1 text-xs text-slate-400">{step.description}</div>
              </motion.div>
              {idx < STEPS.length - 1 && (
                <div className="my-1 flex justify-center text-slate-600" aria-hidden="true">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Button onClick={() => open('ASPIRING_FOUNDER')}>Start Building</Button>
      </div>
    </section>
  );
}
