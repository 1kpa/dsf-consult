'use client';

import { motion } from 'framer-motion';

interface JourneyChainProps {
  steps: string[];
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function JourneyChain({ steps, orientation = 'horizontal', className = '' }: JourneyChainProps) {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`flex ${isHorizontal ? 'flex-wrap items-center' : 'flex-col items-start'} gap-2 ${className}`}>
      {steps.map((step, idx) => (
        <div key={step} className={`flex items-center gap-2 ${isHorizontal ? '' : 'flex-col items-start'}`}>
          <motion.span
            initial={{ opacity: 0, y: isHorizontal ? 6 : 0, x: isHorizontal ? 0 : -6 }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.35 }}
            className="whitespace-nowrap rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-sky-200"
          >
            {step}
          </motion.span>
          {idx < steps.length - 1 && (
            <span className={`text-slate-600 ${isHorizontal ? '' : 'pl-3'}`} aria-hidden="true">
              {isHorizontal ? '→' : '↓'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
