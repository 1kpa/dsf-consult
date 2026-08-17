'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const enquiries = [
  { id: 1, label: 'Facebook Lead', icon: 'ⓘ' },
  { id: 2, label: 'Missed Call', icon: '✕' },
  { id: 3, label: 'Website Form', icon: '⊕' },
  { id: 4, label: 'Instagram DM', icon: '⟡' },
  { id: 5, label: 'Google Enquiry', icon: '◉' },
];

const organizedFlow = [
  { id: 1, label: 'Lead Captured' },
  { id: 2, label: 'Instant Response' },
  { id: 3, label: 'CRM Logged' },
  { id: 4, label: 'Follow-Up Sent' },
  { id: 5, label: 'Appointment Booked' },
];

export function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const chaosContainerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      const items = chaosContainerRef.current?.querySelectorAll('[data-enquiry]');
      if (!items) return;

      // Create timeline that syncs with scroll
      items.forEach((item, index) => {
        const element = item as HTMLElement;
        // Initial chaotic positions
        gsap.set(element, {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 150,
          opacity: 0.5,
          rotation: (Math.random() - 0.5) * 15,
        });

        // Animate to organized right side
        gsap.to(element, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center',
            end: 'center center',
            scrub: 1.2,
            markers: false,
          },
          x: 0,
          y: 0,
          opacity: 1,
          rotation: 0,
          ease: 'power2.inOut',
        });

        // Then fade out and move to organized side
        gsap.to(element, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'center center',
            end: 'bottom center',
            scrub: 1.2,
            markers: false,
          },
          x: 300 + index * 20,
          y: -60 - index * 15,
          opacity: 0.3,
          ease: 'power2.inOut',
        });
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  return (
    <section id="existing-business" ref={sectionRef} className="relative py-16 md:py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start min-h-[600px]">
          {/* LEFT - Headlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="text-sm font-medium uppercase text-slate-400 tracking-wide">
              Already generating enquiries?
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Stop Losing Leads
            </h2>
            <h3 className="text-2xl md:text-3xl font-extrabold text-sky-300">
              You Already Paid For.
            </h3>
            <p className="text-slate-300 mt-4 max-w-lg text-sm md:text-base">
              Scroll to watch what happens when your leads don&apos;t have a system — they scatter everywhere.
              But when DSF builds your system, every enquiry is captured, responded to, and tracked.
            </p>
          </motion.div>

          {/* RIGHT - Animated transformation zone */}
          <div className="relative h-[400px] md:h-[500px] rounded-2xl bg-gradient-to-br from-white/3 to-white/1 border border-white/6 p-6 overflow-hidden">
            {/* Chaotic zone - left side */}
            <div className="absolute inset-0 left-0 w-1/2 p-4 flex flex-col items-center justify-center">
              <div className="text-xs uppercase text-slate-400 font-semibold mb-4">Without System</div>
              <div ref={chaosContainerRef} className="relative w-full h-64 md:h-80">
                {enquiries.map((enquiry) => (
                  <motion.div
                    key={enquiry.id}
                    data-enquiry={enquiry.id}
                    className="absolute px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-200 whitespace-nowrap"
                    style={{ width: 'fit-content' }}
                  >
                    <div className="font-medium">{enquiry.label}</div>
                    <div className="text-rose-300 text-xs mt-1">MISSED</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Organized zone - right side */}
            <div className="absolute inset-0 right-0 w-1/2 p-4 flex flex-col items-center justify-center">
              <div className="text-xs uppercase text-sky-400 font-semibold mb-4">With DSF System</div>
              <div className="space-y-3">
                {organizedFlow.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: item.id * 0.1 }}
                    viewport={{ once: true }}
                    className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-400/30 text-xs text-sky-200 flex items-center gap-2"
                  >
                    <span className="text-green-400">✓</span>
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
