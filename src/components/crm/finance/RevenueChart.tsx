import { formatMoney } from '@/lib/format';

export interface RevenueChartPoint {
  label: string;
  paid: number;
  outstanding: number;
}

interface RevenueChartProps {
  data: RevenueChartPoint[];
  currency: string;
}

/**
 * A small dependency-free stacked bar chart (Paid vs Outstanding per
 * period). No charting library was already in the project, and this is a
 * simple enough shape not to justify adding one.
 */
export function RevenueChart({ data, currency }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-500">
        No invoice activity in this range yet.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.paid + d.outstanding), 1);
  const chartHeight = 200;
  const barWidth = 100 / data.length;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Paid
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-400/70" /> Outstanding / Pending
        </span>
      </div>

      <svg viewBox={`0 0 100 ${chartHeight + 30}`} preserveAspectRatio="none" className="h-56 w-full overflow-visible">
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={100}
            y1={chartHeight - chartHeight * fraction}
            y2={chartHeight - chartHeight * fraction}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={0.3}
          />
        ))}
        {data.map((point, idx) => {
          const total = point.paid + point.outstanding;
          const paidHeight = (point.paid / maxValue) * chartHeight;
          const outstandingHeight = (point.outstanding / maxValue) * chartHeight;
          const x = idx * barWidth + barWidth * 0.15;
          const width = barWidth * 0.7;

          return (
            <g key={point.label}>
              <title>
                {point.label}: {formatMoney(point.paid, currency)} paid, {formatMoney(point.outstanding, currency)} outstanding
              </title>
              {point.outstanding > 0 && (
                <rect
                  x={x}
                  y={chartHeight - paidHeight - outstandingHeight}
                  width={width}
                  height={Math.max(outstandingHeight, total > 0 ? 0.5 : 0)}
                  fill="#fbbf24"
                  fillOpacity={0.7}
                  rx={0.6}
                />
              )}
              {point.paid > 0 && (
                <rect x={x} y={chartHeight - paidHeight} width={width} height={Math.max(paidHeight, 0.5)} fill="#34d399" rx={0.6} />
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-1 flex text-center text-[10px] text-slate-500">
        {data.map((point) => (
          <div key={point.label} style={{ width: `${barWidth}%` }} className="truncate px-0.5">
            {point.label}
          </div>
        ))}
      </div>
    </div>
  );
}
