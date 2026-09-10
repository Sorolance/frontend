"use client";

import { useState } from "react";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { pctToBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];

export function DemoTargetsForm({
  targets,
  thresholdBps,
  onSubmit,
}: {
  targets: Record<AssetSymbol, number>;
  thresholdBps: number;
  onSubmit: (targets: Record<AssetSymbol, number>, thresholdBps: number) => void;
}) {
  const { t } = useLocale();
  const [weights, setWeights] = useState<Record<AssetSymbol, string>>(() =>
    SYMBOLS.reduce(
      (acc, symbol) => ({ ...acc, [symbol]: (targets[symbol] / 100).toString() }),
      {} as Record<AssetSymbol, string>,
    ),
  );
  const [threshold, setThreshold] = useState((thresholdBps / 100).toString());

  const parsed = SYMBOLS.map((symbol) => ({ symbol, bps: pctToBps(weights[symbol]) }));
  const totalBps = parsed.reduce((sum, w) => sum + (w.bps ?? 0), 0);
  const thresholdBpsParsed = pctToBps(threshold);

  const weightsValid = parsed.every((w) => w.bps !== null && w.bps > 0) && totalBps === 10_000;
  const thresholdValid =
    thresholdBpsParsed !== null && thresholdBpsParsed > 0 && thresholdBpsParsed < 10_000;

  function submit() {
    if (!weightsValid || thresholdBpsParsed === null) return;
    const next = parsed.reduce(
      (acc, { symbol, bps }) => ({ ...acc, [symbol]: bps as number }),
      {} as Record<AssetSymbol, number>,
    );
    onSubmit(next, thresholdBpsParsed);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      {SYMBOLS.map((symbol) => (
        <div key={symbol} className="flex items-center gap-3">
          <label className="w-14 shrink-0 text-sm font-medium" htmlFor={`demo-target-${symbol}`}>
            {symbol}
          </label>
          <input
            id={`demo-target-${symbol}`}
            type="text"
            inputMode="decimal"
            value={weights[symbol]}
            onChange={(e) => setWeights((prev) => ({ ...prev, [symbol]: e.target.value }))}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
          />
          <span className="w-4 shrink-0 text-sm text-muted">%</span>
        </div>
      ))}
      <p className={`text-xs ${totalBps === 10_000 ? "text-muted" : "text-status-warning"}`}>
        {t.common.totalMustEqual100((totalBps / 100).toFixed(2))}
      </p>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="demo-target-threshold">
          {t.common.drift}
        </label>
        <input
          id="demo-target-threshold"
          type="text"
          inputMode="decimal"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
        />
        <span className="w-4 shrink-0 text-sm text-muted">%</span>
      </div>

      <button
        type="button"
        disabled={!weightsValid || !thresholdValid}
        onClick={submit}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {t.common.setTargets}
      </button>
    </div>
  );
}
