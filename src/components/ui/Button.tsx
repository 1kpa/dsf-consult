'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isArrow?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isArrow = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'font-medium transition-all duration-300 flex items-center justify-center gap-2 relative group';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-50 border border-slate-700 hover:border-slate-600',
    outline: 'border border-slate-700 text-slate-50 hover:border-slate-600 hover:bg-slate-900/50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl',
  };

  const isFullWidth = className.includes('w-full');

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={isFullWidth ? 'block w-full' : 'inline-block'}
    >
      <button
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        <span>{children}</span>
        {isArrow && (
          <motion.span
            className="group-hover:translate-x-1 transition-transform"
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
          >
            →
          </motion.span>
        )}
      </button>
    </motion.div>
  );
}
