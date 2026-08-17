'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import dynamic from 'next/dynamic';
import JourneyStage from '@/components/sections/JourneyStage';

gsap.registerPlugin(ScrollTrigger);

// Dynamically import 3D canvas for client-only rendering
const DynamicThreeCanvas = dynamic(() => import('@/components/JourneyThreeCanvas'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />,
});

interface Stage {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

const stages: Stage[] = [
  {
    id: 1,
    title: 'ENQUIRY',
    subtitle: 'A customer finds you and reaches out.',
    content: (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 max-w-md mx-auto">
          <div className="text-sm text-slate-400 mb-2">Google</div>
          <div className="text-white font-medium italic">
            &ldquo;Hi, I found you on Google. Are you available tomorrow?&rdquo;
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'CAPTURE',
    subtitle: 'Their information is instantly organized.',
    content: (
      <div className="space-y-4">
        <div className="p-6 rounded-xl bg-sky-500/10 border border-sky-400/30 max-w-md mx-auto">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-sm text-sky-300 font-semibold">Sarah M.</div>
              <div className="text-xs text-slate-300">New Lead</div>
            </div>
            <div className="text-green-400 text-sm font-bold">✓ CAPTURED</div>
          </div>
          <div className="text-xs text-slate-300">
            <div>Source: Google</div>
            <div>Need: Dental Consultation</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: 'RESPONSE',
    subtitle: 'Automatic, instant, and intelligent.',
    content: (
      <div className="space-y-4 max-w-lg mx-auto">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-xs text-slate-400 mb-2">INCOMING</div>
          <div className="text-white italic text-sm">
            &ldquo;Hi, I found you on Google. Are you available tomorrow?&rdquo;
          </div>
        </div>
        <div className="flex justify-center py-2">
          <div className="text-slate-500 text-xs">↓</div>
        </div>
        <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-400/30">
          <div className="text-xs text-sky-300 font-semibold mb-2">DSF SYSTEM</div>
          <div className="text-white text-sm">
            &ldquo;Hi Sarah! Thanks for reaching out. We&apos;d be happy to help. Here&apos;s a link to book a time.&rdquo;
          </div>
          <div className="mt-3 text-xs text-green-400 font-semibold">
            ✓ Sent in 8 seconds
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'CRM',
    subtitle: 'Every lead moves through a clear pipeline.',
    content: (
      <div className="space-y-3 max-w-md mx-auto">
        <div className="flex flex-col gap-2">
          {['NEW', 'CONTACTED', 'QUALIFIED', 'BOOKED'].map((status, idx) => (
            <motion.div
              key={status}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15 }}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                idx <= 1
                  ? 'bg-sky-500/10 border-sky-400/30 text-sky-200'
                  : 'bg-white/5 border-white/10 text-slate-300'
              }`}
            >
              <span className="text-xs text-slate-400 uppercase">
                {idx === 0 ? '📍' : '→'} {status}
              </span>
              {idx <= 1 && <div className="text-xs text-slate-400 mt-1">Sarah M.</div>}
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: 'FOLLOW-UP',
    subtitle: 'No lead is ever forgotten.',
    content: (
      <div className="space-y-4 max-w-md mx-auto">
        {[
          { day: 0, action: 'Instant Response', status: true },
          { day: 1, action: 'Follow-Up Email', status: true },
          { day: 2, action: 'SMS Reminder', status: true },
          { day: 3, action: 'Check-in Call', status: false },
        ].map((item, idx) => (
          <motion.div
            key={item.day}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/6"
          >
            <div className="text-sm font-semibold text-sky-300 min-w-10">Day {item.day}</div>
            <div className="flex-1">
              <div className="text-sm text-white">{item.action}</div>
            </div>
            {item.status && <div className="text-green-400 text-sm">✓</div>}
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 6,
    title: 'APPOINTMENT',
    subtitle: 'The booking is confirmed and ready.',
    content: (
      <div className="space-y-4 max-w-md mx-auto">
        <div className="p-6 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-400/30">
          <div className="text-sm text-sky-300 font-semibold mb-4">APPOINTMENT CONFIRMED</div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Date & Time</span>
              <span className="text-white font-semibold">Tomorrow • 10:30 AM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Duration</span>
              <span className="text-white font-semibold">30 minutes</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Type</span>
              <span className="text-white font-semibold">Consultation</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-sky-400/20">
            <div className="text-green-400 font-bold text-sm">✓ BOOKED</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: 'CUSTOMER',
    subtitle: 'The enquiry has become a customer.',
    content: (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="text-center space-y-3">
          <div className="text-sm uppercase text-slate-400 font-semibold tracking-wide">
            The System in Action
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center justify-center gap-2">
              <span>ENQUIRY</span>
              <span className="text-slate-600">↓</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>RESPONDED</span>
              <span className="text-slate-600">↓</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>FOLLOWED UP</span>
              <span className="text-slate-600">↓</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>BOOKED</span>
              <span className="text-slate-600">↓</span>
            </div>
            <div className="text-lg font-bold text-sky-300">CUSTOMER</div>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-400/20">
          <p className="text-white font-semibold text-center">
            THIS IS WHAT HAPPENS WHEN YOUR LEADS HAVE A SYSTEM BEHIND THEM.
          </p>
        </div>
      </div>
    ),
  },
];

export function ThreeDJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [currentStage, setCurrentStage] = useState(1);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false
  );

  useEffect(() => {
    // Check device
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);

    // Check reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', handler);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !containerRef.current || isMobile) return;

    const ctx = gsap.context(() => {
      // Track scroll position to update current stage
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          const progress = self.progress;
          const stageIndex = Math.floor(progress * stages.length);
          const stage = Math.max(1, Math.min(stages.length, stageIndex + 1));
          setCurrentStage(stage);
        },
      });
    });

    return () => ctx.revert();
  }, [prefersReducedMotion, isMobile]);

  // Update progress bar
  useEffect(() => {
    if (isMobile) return;
    const stageWidth = (currentStage / stages.length) * 100;
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        width: `${stageWidth}%`,
        duration: 0.6,
        ease: 'power2.out',
      });
    }
  }, [currentStage, isMobile]);

  return (
    <section ref={containerRef} className="relative w-full bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Header Section */}
      <div className="relative min-h-screen flex flex-col justify-center items-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            FROM ENQUIRY TO CUSTOMER
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-12">
            Watch what happens when every lead has a system behind it.
          </p>

          {/* Progress Indicator - Desktop Only */}
          {!isMobile && !prefersReducedMotion && (
            <div className="mt-12 space-y-4">
              <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-8">
                {stages.map((stage) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className={`text-xs font-bold uppercase tracking-wide p-2 rounded-lg transition-all ${
                      currentStage >= stage.id
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {stage.id.toString().padStart(2, '0')}
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full"
                  style={{ width: '0%', transition: 'width 0.6s ease-out' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Stages Container */}
      <div className={isMobile ? 'space-y-0' : 'relative'}>
        {isMobile ? (
          // Mobile: Simplified vertical scroll
          stages.map((stage) => (
            <div key={stage.id} className="min-h-screen flex flex-col justify-center items-center px-6 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true, margin: '-50px' }}
                className="max-w-md mx-auto text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400/30 mb-4">
                  <span className="text-lg font-bold text-sky-300">
                    {stage.id.toString().padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mt-3">
                  {stage.title}
                </h3>
                <p className="text-slate-300 mt-2 text-sm">{stage.subtitle}</p>
                <div className="mt-6">{stage.content}</div>
              </motion.div>
            </div>
          ))
        ) : (
          // Desktop: Scroll-driven camera journey
          <>
            {/* 3D Canvas Background - pinned behind the scrolling stages */}
            <div className="sticky top-0 h-screen w-full z-0 pointer-events-none">
              <DynamicThreeCanvas currentStage={currentStage} totalStages={stages.length} />
            </div>

            {/* Stages as scroll zones */}
            <div className="relative z-10 -mt-[100vh]">
              {stages.map((stage) => (
                <JourneyStage
                  key={stage.id}
                  stage={stage.id}
                  title={stage.title}
                  description={stage.subtitle}
                  isActive={currentStage === stage.id}
                >
                  {stage.content}
                </JourneyStage>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CTA Section */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center items-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your business?
          </h3>
          <p className="text-slate-300 mb-8">
            Let&apos;s build a system that turns every enquiry into a booked customer.
          </p>
          <button className="px-8 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold hover:shadow-lg hover:shadow-sky-500/50 transition-all duration-300">
            Build My System
          </button>
        </motion.div>
      </div>
    </section>
  );
}
