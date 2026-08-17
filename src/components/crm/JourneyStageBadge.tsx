import type { JourneyStage } from '@prisma/client';
import { JOURNEY_STAGE_LABELS } from '@/lib/journey';

const JOURNEY_STYLES: Record<JourneyStage, string> = {
  ASPIRING_FOUNDER: 'bg-violet-500/15 text-violet-300 border-violet-400/30',
  EARLY_STAGE: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
  GROWTH: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
  SYSTEMIZATION: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
  SCALING: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
  UNSURE: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
};

export function JourneyStageBadge({ stage }: { stage: JourneyStage | null }) {
  if (!stage) {
    return (
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-500">
        No assessment
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${JOURNEY_STYLES[stage]}`}>
      {JOURNEY_STAGE_LABELS[stage]}
    </span>
  );
}
