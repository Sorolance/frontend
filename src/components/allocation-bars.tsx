import { formatBps, formatSignedBps } from "@/lib/format";

export interface AllocationBarEntry {
  key: string;
  label: string;
  current_weight_bps: number;
  target_weight_bps: number;
  drift_bps: number;
}

/** Pure rendering, no data source - `AllocationChart` (live, reads the
 * deployed vault) and the demo dashboard (simulated, no wallet) both feed
 * this the same shape so the visualization itself never has to know
 * which one it's looking at. */
export function AllocationBars({ entries }: { entries: AllocationBarEntry[] }) {
  const maxAbsDrift = Math.max(
    1_000,
    ...entries.map((entry) => Math.abs(entry.drift_bps)),
  ) * 1.2;

  return (
    <div>
      <div className="space-y-4">
        {entries.map((entry) => {
          const pct = (Math.abs(entry.drift_bps) / maxAbsDrift) * 50;
          const isUnder = entry.drift_bps < 0;

          return (
            <div
              key={entry.key}
              className="grid grid-cols-[1fr_auto] items-center gap-4"
            >
              <div className="relative h-6" title={`drift ${formatSignedBps(entry.drift_bps)}`}>
                <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
                {pct > 0 && (
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: isUnder ? `calc(50% - ${pct}%)` : "50%",
                      width: `${pct}%`,
                      backgroundColor: isUnder
                        ? "var(--color-divergent-under)"
                        : "var(--color-divergent-over)",
                      borderTopLeftRadius: isUnder ? 4 : 0,
                      borderBottomLeftRadius: isUnder ? 4 : 0,
                      borderTopRightRadius: isUnder ? 0 : 4,
                      borderBottomRightRadius: isUnder ? 0 : 4,
                    }}
                  />
                )}
              </div>
              <div className="w-36 shrink-0 text-right tabular-nums">
                <div className="text-sm font-medium">{entry.label}</div>
                <div className="text-xs text-muted">
                  {formatBps(entry.current_weight_bps)} vs{" "}
                  {formatBps(entry.target_weight_bps)} target
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-divergent-under)" }}
          />
          underweight (below target)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-divergent-over)" }}
          />
          overweight (above target)
        </span>
      </div>
    </div>
  );
}
