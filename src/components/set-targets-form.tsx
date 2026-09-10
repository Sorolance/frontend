"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useAllocation, useSetTargets } from "@/hooks/use-vault";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { pctToBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";
import type { TargetWeight } from "@/contracts/vault";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];
const EMPTY_WEIGHTS: Record<AssetSymbol, string> = { XLM: "", USDC: "" };

export function SetTargetsForm({ vaultAddress }: { vaultAddress?: string } = {}) {
  const { address } = useWallet();
  const { data: allocation } = useAllocation(vaultAddress);
  const setTargets = useSetTargets();
  const { t } = useLocale();

  const [weights, setWeights] = useState<Record<AssetSymbol, string>>(EMPTY_WEIGHTS);
  const [threshold, setThreshold] = useState("");
  // Once the user edits a field, `weights` (not the vault's current
  // targets) becomes the source of truth for every field - flipped back
  // to false after a successful submit so the next prefill reflects what
  // was just set.
  const [touched, setTouched] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Derived, not stored: reading the vault's current targets straight
  // into render avoids the cascading-render setState-in-effect pattern
  // (see react-hooks/set-state-in-effect) while still refreshing whenever
  // `useAllocation`'s background refetch brings in new data, right up
  // until the user actually touches an input.
  const defaultWeights: Record<AssetSymbol, string> = allocation
    ? SYMBOLS.reduce((acc, symbol) => {
        const entry = allocation.find((e) => e.asset === ASSETS[symbol].contractId);
        acc[symbol] = entry ? (entry.target_weight_bps / 100).toString() : "";
        return acc;
      }, { ...EMPTY_WEIGHTS })
    : EMPTY_WEIGHTS;
  const displayedWeights = touched ? weights : defaultWeights;

  function setWeight(symbol: AssetSymbol, value: string) {
    // First keystroke snapshots the current defaults for every *other*
    // field too, so they don't blank out just because this one field
    // switched from "derived" to "user-owned" state.
    setWeights((prev) => ({ ...(touched ? prev : defaultWeights), [symbol]: value }));
    setTouched(true);
  }

  const parsedWeights = SYMBOLS.map((symbol) => ({
    symbol,
    bps: pctToBps(displayedWeights[symbol]),
  }));
  const totalBps = parsedWeights.reduce((sum, w) => sum + (w.bps ?? 0), 0);
  const thresholdBps = pctToBps(threshold);

  const weightsValid =
    parsedWeights.every((w) => w.bps !== null && w.bps > 0) &&
    totalBps === 10_000;
  const thresholdValid =
    thresholdBps !== null && thresholdBps > 0 && thresholdBps < 10_000;
  const disabled = !address || !weightsValid || !thresholdValid || setTargets.isPending;

  async function submit() {
    if (!address || !weightsValid || thresholdBps === null) return;
    setFeedback(null);
    try {
      const targets: TargetWeight[] = parsedWeights.map(({ symbol, bps }) => ({
        asset: ASSETS[symbol].contractId,
        price_asset: ASSETS[symbol].priceAsset,
        weight_bps: bps as number,
      }));
      await setTargets.mutateAsync({ address, targets, thresholdBps, vaultAddress });
      setFeedback(t.setTargetsForm.targetsUpdated);
      setTouched(false);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t.common.transactionFailed);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {SYMBOLS.map((symbol) => (
        <div key={symbol} className="flex items-center gap-3">
          <label className="w-14 shrink-0 text-sm font-medium" htmlFor={`target-${symbol}`}>
            {symbol}
          </label>
          <input
            id={`target-${symbol}`}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={displayedWeights[symbol]}
            onChange={(e) => setWeight(symbol, e.target.value)}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
          />
          <span className="w-4 shrink-0 text-sm text-muted">%</span>
        </div>
      ))}
      <p className={`text-xs ${totalBps === 10_000 ? "text-muted" : "text-status-warning"}`}>
        {t.common.totalMustEqual100((totalBps / 100).toFixed(2))}
      </p>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="target-threshold">
          {t.common.drift}
        </label>
        <input
          id="target-threshold"
          type="text"
          inputMode="decimal"
          placeholder={t.common.thresholdPlaceholder}
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
        />
        <span className="w-4 shrink-0 text-sm text-muted">%</span>
      </div>
      <p className="text-xs text-muted">{t.setTargetsForm.driftHelp}</p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => void submit()}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t.common.setTargets}
      </button>

      {!address && (
        <p className="text-xs text-muted">{t.setTargetsForm.connectToChangeTargets}</p>
      )}
      {feedback && <p className="text-xs text-muted">{feedback}</p>}
    </div>
  );
}
