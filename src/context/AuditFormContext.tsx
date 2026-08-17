'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { JourneyStageValue } from '@/lib/validation/lead';

interface AuditFormContextValue {
  isOpen: boolean;
  /** Preset journey stage set by the caller that opened the modal (e.g. a pathway card), if any. */
  presetJourneyStage: JourneyStageValue | null;
  /** Pass a journey stage to skip the first question and jump straight into that branch. */
  open: (presetJourneyStage?: JourneyStageValue) => void;
  close: () => void;
}

const AuditFormContext = createContext<AuditFormContextValue | null>(null);

export function AuditFormProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetJourneyStage, setPresetJourneyStage] = useState<JourneyStageValue | null>(null);

  const open = useCallback((preset?: JourneyStageValue) => {
    setPresetJourneyStage(preset ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ isOpen, presetJourneyStage, open, close }),
    [isOpen, presetJourneyStage, open, close]
  );

  return <AuditFormContext.Provider value={value}>{children}</AuditFormContext.Provider>;
}

export function useAuditForm(): AuditFormContextValue {
  const ctx = useContext(AuditFormContext);
  if (!ctx) {
    throw new Error('useAuditForm must be used within an AuditFormProvider');
  }
  return ctx;
}
