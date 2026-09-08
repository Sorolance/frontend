"use client";

import { useAllocation } from "@/hooks/use-vault";
import { formatBps, formatSignedBps } from "@/lib/format";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";

function symbolFor(contractId: string): AssetSymbol | undefined {
  return (Object.keys(ASSETS) as AssetSymbol[]).find(
    (symbol) => ASSETS[symbol].contractId === contractId,
  );
}

export function AllocationChart() {
  const { data: allocation, isPending, isError, error } = useAllocation();

  if (isPending) {
    return (
      <div className="space-y-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-border/60" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted">
        Couldn&apos;t read live allocation from the vault contract:{" "}
        {error instanceof Error ? error.message : "unknown error"}
      </p>
    );
  }

  const maxAbsDrift = Math.max(
    1_000,
    ...allocation.map((entry) => Math.abs(entry.drift_bps)),
  ) * 1.2;

  return (
    <div>
      <div className="space-y-4">
        {allocation.map((entry) => {
          const symbol = symbolFor(entry.asset);
          const pct = (Math.abs(entry.drift_bps) / maxAbsDrift) * 50;
          const isUnder = entry.drift_bps < 0;

          return (
            <div
              key={entry.asset}
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
                <div className="text-sm font-medium">
                  {symbol ?? entry.asset.slice(0, 6)}
                </div>
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
