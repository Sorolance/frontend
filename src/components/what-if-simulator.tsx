"use client";

import { useState } from "react";
import type { ApiTarget } from "@/lib/api/portfolios";
import { useSimulatePortfolio } from "@/hooks/use-simulate";
import { AllocationBars } from "@/components/allocation-bars";
import { ASSETS, symbolFor } from "@/lib/stellar/config";
import { fromStroops, pctToBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";

/** "BTC drops 30% tomorrow" (PROJECT.md differentiator #9): shocks any
 * target's price by a caller-entered percentage and projects the resulting
 * drift/trades via `useSimulatePortfolio`, without a wallet or submitting
 * anything on-chain. */
export function WhatIfSimulator({
  portfolioId,
  vaultAddress,
  targets,
}: {
  portfolioId: string;
  vaultAddress: string;
  targets: ApiTarget[];
}) {
  const { t } = useLocale();
  const simulate = useSimulatePortfolio(portfolioId, vaultAddress, targets);
  const [shockInputs, setShockInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    const shocks: Record<string, number> = {};
    for (const target of targets) {
      const bps = pctToBps(shockInputs[target.asset] ?? "");
      if (bps !== null && bps !== 0) shocks[target.asset] = bps;
    }
    try {
      await simulate.mutateAsync(shocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.whatIfSimulator.simulateFailed(t.common.unknownError));
    }
  }

  const result = simulate.data;

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-xs text-muted">{t.whatIfSimulator.help}</p>

      {targets.map((target) => {
        const symbol = symbolFor(target.asset) ?? target.asset.slice(0, 6);
        return (
          <div key={target.asset} className="flex items-center gap-3">
            <label className="w-14 shrink-0 text-sm font-medium" htmlFor={`shock-${target.asset}`}>
              {symbol}
            </label>
            <input
              id={`shock-${target.asset}`}
              type="text"
              inputMode="decimal"
              placeholder={t.whatIfSimulator.shockPlaceholder}
              value={shockInputs[target.asset] ?? ""}
              onChange={(e) =>
                setShockInputs((prev) => ({ ...prev, [target.asset]: e.target.value }))
              }
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
            />
            <span className="w-4 shrink-0 text-sm text-muted">%</span>
          </div>
        );
      })}

      <button
        type="button"
        disabled={simulate.isPending}
        onClick={() => void run()}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {simulate.isPending ? t.whatIfSimulator.running : t.whatIfSimulator.run}
      </button>

      {error && <p className="text-xs text-status-warning">{error}</p>}

      {result && (
        <div className="space-y-3 border-t border-border pt-3">
          <p className="text-sm font-medium">
            {result.needs_rebalance ? t.whatIfSimulator.wouldRebalance : t.whatIfSimulator.onTarget}
          </p>

          <AllocationBars
            entries={result.allocation.map((entry) => ({
              key: entry.asset,
              label: symbolFor(entry.asset) ?? entry.asset.slice(0, 6),
              current_weight_bps: entry.current_weight_bps,
              target_weight_bps: entry.target_weight_bps,
              drift_bps: entry.drift_bps,
            }))}
          />

          <div>
            <h3 className="mb-2 text-xs font-medium text-muted">
              {t.whatIfSimulator.projectedTrades}
            </h3>
            {result.trades.length === 0 && (
              <p className="text-xs text-muted">{t.whatIfSimulator.noTrades}</p>
            )}
            {result.trades.length > 0 && (
              <ul className="space-y-1 text-xs text-muted">
                {result.trades.map((trade, i) => {
                  const assetInSymbol = symbolFor(trade.asset_in);
                  const assetOutSymbol = symbolFor(trade.asset_out) ?? trade.asset_out.slice(0, 6);
                  const decimals = assetInSymbol ? ASSETS[assetInSymbol].decimals : 7;
                  return (
                    <li key={i}>
                      {t.whatIfSimulator.tradeLine(
                        fromStroops(BigInt(trade.amount_in), decimals),
                        assetInSymbol ?? trade.asset_in.slice(0, 6),
                        assetOutSymbol,
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
