'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { JourneyChain } from '@/components/ui/JourneyChain';
import { useAuditForm } from '@/context/AuditFormContext';

const PATH_A_STEPS = ['IDEA', 'NICHE', 'OFFER', 'BRAND', 'WEBSITE', 'CRM', 'CLIENT ACQUISITION', 'AUTOMATION', 'CUSTOMERS', 'SCALE'];
const PATH_B_STEPS = ['BUSINESS', 'SYSTEM AUDIT', 'LEAD CAPTURE', 'CRM', 'AUTOMATION', 'FOLLOW-UP', 'APPOINTMENTS', 'CUSTOMERS', 'SCALE'];

export function TwoPathwaysSection() {
  const { open } = useAuditForm();

  return (
    <section className="relative py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">WHERE ARE YOU IN YOUR BUSINESS JOURNEY?</h2>
          <p className="mt-4 text-slate-300">Choose where you&apos;re starting. We&apos;ll help you build what comes next.</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.07] to-white/[0.02] p-8 transition-colors hover:border-violet-400/40"
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-300">Path A</div>
            <h3 className="mb-3 text-2xl font-bold text-white">I Want to Start a Business</h3>
            <p className="mb-6 text-sm text-slate-300">
              I have skills, experience or an idea and want to turn it into a structured online or service
              business.
            </p>
            <div className="mb-8 overflow-x-auto pb-1">
              <JourneyChain steps={PATH_A_STEPS} />
            </div>
            <Button onClick={() => open('ASPIRING_FOUNDER')}>Start My Business</Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-500/[0.07] to-white/[0.02] p-8 transition-colors hover:border-sky-400/40"
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-sky-300">Path B</div>
            <h3 className="mb-3 text-2xl font-bold text-white">I Already Have a Business</h3>
            <p className="mb-6 text-sm text-slate-300">
              I already serve customers and want better systems for generating, managing and converting
              opportunities.
            </p>
            <div className="mb-8 overflow-x-auto pb-1">
              <JourneyChain steps={PATH_B_STEPS} />
            </div>
            <Button onClick={() => open()}>Systemize My Business</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
