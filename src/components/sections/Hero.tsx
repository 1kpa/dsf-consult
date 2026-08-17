 'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import VideoPlayer from '@/components/ui/VideoPlayer';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';
import { useAuditForm } from '@/context/AuditFormContext';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const { open } = useAuditForm();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  function scrollToSystems() {
    document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Hero scroll effects
    if (videoContainerRef.current && leftRef.current) {
      const ctx = gsap.context(() => {
        // Video scale and fade effect
        gsap.to(videoContainerRef.current, {
          scrollTrigger: {
            trigger: videoContainerRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            markers: false,
          },
          scale: 1.06,
          opacity: 0.85,
          ease: 'none',
        });

        // Headline upward movement
        gsap.to(leftRef.current, {
          scrollTrigger: {
            trigger: leftRef.current,
            start: 'top center',
            end: 'bottom center',
            scrub: 1,
            markers: false,
          },
          y: -30,
          ease: 'none',
        });
      });

      return () => ctx.revert();
    }
  }, [prefersReducedMotion]);

  return (
    <section className="relative w-full pt-24 pb-12 lg:pt-28 lg:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* LEFT - Copy */}
        <div ref={leftRef} className="space-y-6">
          <div className="text-sm font-medium uppercase text-sky-300 tracking-wide">AI-POWERED BUSINESS SYSTEMS</div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-slate-50 max-w-xl"
          >
            Build a Business.
            <br />
            Build the System.
            <br />
            <span className="text-sky-300">Scale Smarter.</span>
          </motion.h1>

          <motion.p
            className="text-slate-300 max-w-lg"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Whether you&apos;re starting from scratch or already serving customers, DSF Consult helps you
            build the digital infrastructure, client acquisition systems and automation needed to grow.
          </motion.p>

          <div className="flex items-center gap-4">
            <Button size="md" onClick={() => open()}>Start Building</Button>
            <Button variant="outline" size="md" onClick={scrollToSystems}>Explore Our Systems</Button>
          </div>

          <div className="mt-4 text-sm text-slate-400">
            From idea to infrastructure. From enquiry to customer.
          </div>
        </div>

        {/* RIGHT - Cinematic media container */}
        <div ref={videoContainerRef} className="relative w-full h-72 md:h-96 lg:h-[460px]">
          <VideoPlayer
            src="/videos/dsf-hero.mp4"
            poster="/posters/hero.jpg"
            maskEdges={true}
          />

          {/* Floating UI overlays - Sequential entrance */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="absolute left-4 top-4 md:left-6 md:top-6 bg-gradient-to-br from-white/8 to-white/3 border border-white/12 backdrop-blur-md rounded-lg p-3 text-xs text-white shadow-lg"
            style={{ width: 160 }}
          >
            <div className="font-semibold text-slate-50">NEW LEAD</div>
            <div className="mt-1 font-medium text-slate-100">Sarah M.</div>
            <div className="text-slate-300 text-xs">Dental Consultation</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
            className="absolute right-4 md:right-6 top-1/3 md:top-auto md:bottom-24 md:right-6 bg-gradient-to-br from-white/8 to-white/3 border border-white/12 backdrop-blur-md rounded-lg p-3 text-xs text-white shadow-lg"
            style={{ width: 145 }}
          >
            <div className="font-semibold text-slate-50">AI RESPONSE</div>
            <div className="mt-1 text-slate-300 text-xs">Sent in 8 seconds</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
            className="absolute left-4 md:left-6 bottom-4 md:bottom-6 bg-gradient-to-br from-white/8 to-white/3 border border-white/12 backdrop-blur-md rounded-lg p-3 text-xs text-white shadow-lg"
            style={{ width: 180 }}
          >
            <div className="font-semibold text-slate-50">APPOINTMENT</div>
            <div className="mt-1 text-slate-300 text-xs">Tomorrow • 10:30 AM</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
