"use client";

import { useAllocation } from "@/hooks/use-vault";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { AllocationBars } from "@/components/allocation-bars";

function symbolFor(contractId: string): AssetSymbol | undefined {
  return (Object.keys(ASSETS) as AssetSymbol[]).find(
    (symbol) => ASSETS[symbol].contractId === contractId,
  );
}

export function AllocationChart({ vaultAddress }: { vaultAddress?: string } = {}) {
  const { data: allocation, isPending, isError, error } = useAllocation(vaultAddress);

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

  return (
    <AllocationBars
      entries={allocation.map((entry) => ({
        key: entry.asset,
        label: symbolFor(entry.asset) ?? entry.asset.slice(0, 6),
        current_weight_bps: entry.current_weight_bps,
        target_weight_bps: entry.target_weight_bps,
        drift_bps: entry.drift_bps,
      }))}
    />
  );
}
