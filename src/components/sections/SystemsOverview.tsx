 'use client';

import { motion } from 'framer-motion';
import { Stagger, StaggerChild } from '@/components/ui/Motion';

function IconUserPlus() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5s-3 1.343-3 3 1.343 3 3 3z" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 20v-1a4 4 0 014-4h0" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.07.76 3.03a2 2 0 0 1-.45 2.11L8.09 10.91a16 16 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.38 1.98.64 3.03.76A2 2 0 0 1 22 16.92z" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="5" rx="7" ry="3" stroke="#7dd3fc" strokeWidth="1.2" />
      <path d="M5 5v6c0 1.657 3.134 3 7 3s7-1.343 7-3V5" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 11v6c0 1.657 3.134 3 7 3s7-1.343 7-3v-6" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRepeat() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 7v6h-6" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17v-6h6" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 7c-2.5 2.5-6.5 4-10 4s-7.5-1.5-10-4" stroke="#60a5fa" strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="#7dd3fc" strokeWidth="1.2" />
      <path d="M16 3v4M8 3v4" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 12a9 9 0 1 0-3 6.7" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3v6h-6" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMessage() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M3 3v18h18" stroke="#7dd3fc" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17V9" stroke="#7dd3fc" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 17V13" stroke="#60a5fa" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 17v-4" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const systems = [
  { id: 1, name: 'Lead Capture', description: 'Smart forms and landing pages that convert visitors into qualified leads', icon: <IconUserPlus /> },
  { id: 2, name: 'AI Reception', description: '24/7 answering, qualification and booking', icon: <IconPhone /> },
  { id: 3, name: 'CRM', description: 'Centralized database tracking every prospect interaction', icon: <IconDatabase /> },
  { id: 4, name: 'Automated Follow-Up', description: 'Email, SMS and sequences that nurture leads', icon: <IconRepeat /> },
  { id: 5, name: 'Appointment Booking', description: 'Calendar integration for instant bookings', icon: <IconCalendar /> },
  { id: 6, name: 'Lead Reactivation', description: 'Resurface old leads and convert them', icon: <IconRefresh /> },
  { id: 7, name: 'Review Generation', description: 'Automate review requests and reputation growth', icon: <IconMessage /> },
  { id: 8, name: 'Reporting', description: 'Clear dashboards that show conversion lift', icon: <IconChart /> },
];

export function SystemsOverviewSection() {
  return (
    <section id="systems" className="relative py-16 md:py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mb-8 md:mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">EVERYTHING YOUR BUSINESS NEEDS TO CONVERT MORE ENQUIRIES.</h2>
          <p className="text-slate-300 max-w-2xl mx-auto">A modular set of connected systems designed for local service businesses — configurable to your workflow.</p>
        </motion.div>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <StaggerChild key={system.id}>
              <motion.div className="group relative p-6 bg-white/3 border border-white/6 rounded-2xl hover:scale-[1.02] transition-transform duration-300 overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/5 rounded-lg text-sky-300">{system.icon}</div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{system.name}</h3>
                    <p className="text-slate-300 text-sm mt-2">{system.description}</p>
                  </div>
                </div>
              </motion.div>
            </StaggerChild>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
