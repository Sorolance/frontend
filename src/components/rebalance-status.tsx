"use client";

import { useNeedsRebalance } from "@/hooks/use-vault";

export function RebalanceStatus({ vaultAddress }: { vaultAddress?: string } = {}) {
  const { data: needsRebalance, isPending, isError } = useNeedsRebalance(vaultAddress);

  if (isPending) {
    return <div className="h-6 w-40 animate-pulse rounded-full bg-border/60" />;
  }
  if (isError) return null;

  const color = needsRebalance
    ? "var(--color-status-warning)"
    : "var(--color-status-good)";
  const label = needsRebalance
    ? "Drift exceeds threshold - rebalance needed"
    : "On target";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
