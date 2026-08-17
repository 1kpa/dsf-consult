'use client';

import { motion } from 'framer-motion';
import { Stagger, StaggerChild } from '@/components/ui/Motion';

const steps = [
  {
    number: '01',
    title: 'Audit Your System',
    description:
      'We analyze your current lead flow, identify leaks, and spot opportunities you\'re missing.',
  },
  {
    number: '02',
    title: 'Build Your System',
    description:
      'We design and deploy an automated system tailored to your business, industry, and goals.',
  },
  {
    number: '03',
    title: 'Train Your Team',
    description:
      'Your team learns how to use the system, manage leads, and close more deals faster.',
  },
  {
    number: '04',
    title: 'Track & Optimize',
    description:
      'We monitor performance, test improvements, and continuously increase your conversion rate.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-16 md:py-24 lg:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="mb-12 md:mb-16 text-center"
        >
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6 text-white">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg md:text-xl text-dark-300 max-w-2xl mx-auto">
            Four simple steps to transform your lead generation and close more deals
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-500/50 via-accent-500/30 to-transparent transform -translate-x-1/2" />

          <Stagger className="space-y-8 md:space-y-12 lg:space-y-16">
            {steps.map((step, index) => (
              <StaggerChild key={index}>
                <motion.div
                  className={`flex gap-6 md:gap-8 lg:gap-12 items-start ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                  whileInView={{ opacity: 1, x: 0 }}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {/* Number Circle */}
                  <motion.div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="font-display text-5xl md:text-6xl font-bold gradient-text mb-2">
                        {step.number}
                      </div>
                    </div>
                  </motion.div>

                  {/* Content */}
                  <motion.div className="flex-grow pt-2 md:pt-4">
                    <h3 className="font-display text-2xl md:text-3xl font-bold mb-3 text-white">
                      {step.title}
                    </h3>
                    <p className="text-lg text-dark-300 leading-relaxed">{step.description}</p>

                    {/* Visual Connection on Mobile */}
                    {index < steps.length - 1 && (
                      <motion.div className="block lg:hidden mt-8 h-12 flex items-center">
                        <div className="w-1 h-full bg-gradient-to-b from-accent-500/50 to-transparent" />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
