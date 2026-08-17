import { forwardRef, type SelectHTMLAttributes } from 'react';

/**
 * Thin wrapper around the native <select>. Deliberately NOT a custom
 * listbox — native selects give correct keyboard nav, type-ahead, and
 * screen-reader behavior for free. The dark-popup contrast fix lives in
 * globals.css (`color-scheme: dark` + explicit `option` colors) and applies
 * to every <select> in the app; this component just standardizes the
 * closed-state box styling so CRM selects look consistent everywhere.
 */
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className = '', children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={`rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
