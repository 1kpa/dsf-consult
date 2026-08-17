'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuditForm } from '@/context/AuditFormContext';

export function SystemsAuditCTASection() {
  const { open } = useAuditForm();
  const benefits = [
    'Get clarity on your next step',
    'Identify quick wins',
    'Get a custom growth plan',
    'Zero cost, zero obligation',
  ];

  return (
    <section className="relative py-16 md:py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Main CTA Card */}
        <motion.div
          className="relative overflow-hidden rounded-3xl md:rounded-4xl bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 p-8 md:p-12 lg:p-16"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-accent-500/20 via-transparent to-accent-600/10"
            animate={{ x: ['0%', '100%', '0%'] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          {/* Glowing Orbs */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-accent-500/20 rounded-full blur-3xl"
            animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-600/10 rounded-full blur-3xl"
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          />

          {/* Content */}
          <motion.div className="relative z-10 text-center">
            <motion.p
              className="inline-block text-sm md:text-base font-medium text-accent-400 bg-accent-500/10 border border-accent-500/30 rounded-full px-4 py-2 mb-6 md:mb-8"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Limited Time Offer
            </motion.p>

            <motion.h2
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your Free <span className="gradient-text">DSF Growth Assessment</span> Awaits
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl text-dark-300 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Tell us where you are today. We&apos;ll identify the systems and next steps that make the most
              sense for where you want to go.
            </motion.p>

            {/* Benefits List */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-10 md:mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center gap-3 text-dark-300"
                  whileInView={{ x: 0, opacity: 1 }}
                  initial={{ x: -20, opacity: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <span className="text-accent-400 font-bold">✓</span>
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="lg" isArrow onClick={() => open()}>
                Take the Free Growth Assessment
              </Button>
              <p className="text-sm text-dark-400">Takes just a few minutes</p>
            </motion.div>

            {/* Trust Statement */}
            <motion.p
              className="text-sm text-dark-500 mt-8 md:mt-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Founders and business owners are already building with DSF Consult.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
