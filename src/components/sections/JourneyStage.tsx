'use client';

import { motion } from 'framer-motion';

interface JourneyStageProps {
  stage: number;
  title: string;
  description?: string;
  children?: React.ReactNode;
  isActive?: boolean;
}

export default function JourneyStage({
  stage,
  title,
  description,
  children,
  isActive = false,
}: JourneyStageProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.4 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col justify-center items-center p-6 relative ${
        isActive ? 'z-20' : 'z-10'
      }`}
    >
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          animate={{ scale: isActive ? 1 : 0.9 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-600/20 border border-sky-400/30 mb-4">
            <span className="text-2xl font-bold text-sky-300">
              {String(stage).padStart(2, '0')}
            </span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mt-4">{title}</h3>
          {description && (
            <p className="text-slate-300 mt-3 text-base">{description}</p>
          )}
        </motion.div>

        {children && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: isActive ? 0 : 20, opacity: isActive ? 1 : 0.5 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
