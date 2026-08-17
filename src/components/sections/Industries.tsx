'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

export function IndustriesSection() {
  const [active, setActive] = useState('Dental');

  const workflows: Record<string, string[]> = {
    Dental: ['Google Search', 'Invisalign Enquiry', 'Instant Response', 'Qualification', 'Consultation', 'Patient'],
    Cleaning: ['Facebook Ad', 'Quote Request', 'Property Details', 'Automated Follow-Up', 'Quote', 'Client'],
    HVAC: ['Google Search', 'Emergency Request', 'Immediate Response', 'Qualification', 'Technician Booking', 'Customer'],
  };

  return (
    <section id="industries" className="relative py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-8 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">BUILT AROUND HOW YOUR BUSINESS ACTUALLY WORKS.</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">Pick an industry to see a tailored workflow that reflects real-world customer journeys.</p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4 space-y-3">
            {['Dental', 'Medical', 'Legal', 'Cleaning', 'HVAC', 'Contractors', 'Real Estate', 'Education', 'Beauty'].map((i) => (
              <button key={i} onClick={() => setActive(i)} className={`w-full text-left p-3 rounded-lg ${active === i ? 'bg-white/6 text-white' : 'bg-white/3 text-slate-300'}`}>
                {i}
              </button>
            ))}
          </div>

          <div className="w-full md:w-3/4 p-6 rounded-2xl bg-white/3 border border-white/6">
            <div className="mb-4 text-sky-300 font-semibold">{active}</div>
            <div className="text-white font-bold text-xl mb-3">Workflow</div>
            <div className="flex flex-wrap items-center gap-4">
              {(workflows[active] || workflows['Dental']).map((step, idx) => (
                <div key={idx} className="px-4 py-2 bg-white/5 rounded-full text-sm text-slate-200">{step}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
