'use client';

import { motion } from 'framer-motion';
import { JourneyChain } from '@/components/ui/JourneyChain';

/**
 * A lightweight (non-3D) bridge shown right before the big Enquiry → Customer
 * 3D journey below. It exists purely to show that both audiences converge
 * into the same growth system — it is NOT a replacement for that 3D
 * experience, which stays fully intact.
 */
export function JourneyEntryPointsSection() {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-violet-400/20 bg-violet-500/5 p-6"
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-violet-300">
              Starting From Zero
            </div>
            <div className="flex items-center justify-center gap-3 text-sm font-semibold text-white">
              <span>Idea</span>
              <span className="text-slate-500" aria-hidden="true">→</span>
              <span>Business</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-sky-400/20 bg-sky-500/5 p-6"
          >
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-sky-300">
              Already In Business
            </div>
            <div className="flex items-center justify-center gap-3 text-sm font-semibold text-white">
              <span>Business</span>
              <span className="text-slate-500" aria-hidden="true">→</span>
              <span>System</span>
            </div>
          </motion.div>
        </div>

        <div className="mb-6 flex justify-center text-xl text-slate-600" aria-hidden="true">
          ↓
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-block rounded-full border border-sky-400/30 bg-sky-500/10 px-5 py-2 text-sm font-bold uppercase tracking-wide text-sky-300"
        >
          DSF Growth System
        </motion.div>

        <div className="flex justify-center">
          <JourneyChain steps={['Leads', 'CRM', 'Automation', 'Customers', 'Scale']} />
        </div>
      </div>
    </section>
  );
}
