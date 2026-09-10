"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useCreatePortfolio, type NewPortfolioTarget } from "@/hooks/use-portfolios";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { pctToBps } from "@/lib/format";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];
const EMPTY_WEIGHTS: Record<AssetSymbol, string> = { XLM: "", USDC: "" };

export function CreatePortfolioForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const { address } = useWallet();
  const createPortfolio = useCreatePortfolio();

  const [name, setName] = useState("");
  const [weights, setWeights] = useState<Record<AssetSymbol, string>>(EMPTY_WEIGHTS);
  const [threshold, setThreshold] = useState("5");
  const [feedback, setFeedback] = useState<string | null>(null);

  const parsedWeights = SYMBOLS.map((symbol) => ({
    symbol,
    bps: pctToBps(weights[symbol]),
  }));
  const totalBps = parsedWeights.reduce((sum, w) => sum + (w.bps ?? 0), 0);
  const thresholdBps = pctToBps(threshold);

  const weightsValid =
    parsedWeights.every((w) => w.bps !== null && w.bps > 0) && totalBps === 10_000;
  const thresholdValid = thresholdBps !== null && thresholdBps > 0 && thresholdBps < 10_000;
  const nameValid = name.trim().length > 0;
  const disabled =
    !address || !nameValid || !weightsValid || !thresholdValid || createPortfolio.isPending;

  async function submit() {
    if (!address || !weightsValid || thresholdBps === null) return;
    setFeedback(
      "Deploying vault, initializing, and authorizing the keeper — approve each in your wallet…",
    );
    try {
      const targets: NewPortfolioTarget[] = parsedWeights.map(({ symbol, bps }) => ({
        asset: ASSETS[symbol].contractId,
        priceAsset: ASSETS[symbol].priceAsset,
        weightBps: bps as number,
      }));
      const portfolio = await createPortfolio.mutateAsync({
        address,
        name: name.trim(),
        thresholdBps,
        targets,
      });
      setFeedback("Portfolio created.");
      setName("");
      setWeights(EMPTY_WEIGHTS);
      onCreated?.(portfolio.id);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to create portfolio.");
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="portfolio-name">
          Name
        </label>
        <input
          id="portfolio-name"
          type="text"
          placeholder="e.g. Retirement"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
        />
      </div>

      {SYMBOLS.map((symbol) => (
        <div key={symbol} className="flex items-center gap-3">
          <label className="w-14 shrink-0 text-sm font-medium" htmlFor={`new-target-${symbol}`}>
            {symbol}
          </label>
          <input
            id={`new-target-${symbol}`}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={weights[symbol]}
            onChange={(e) => setWeights((prev) => ({ ...prev, [symbol]: e.target.value }))}
            className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
          />
          <span className="w-4 shrink-0 text-sm text-muted">%</span>
        </div>
      ))}
      <p className={`text-xs ${totalBps === 10_000 ? "text-muted" : "text-status-warning"}`}>
        Total: {(totalBps / 100).toFixed(2)}% (must equal 100.00%)
      </p>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="new-threshold">
          Drift
        </label>
        <input
          id="new-threshold"
          type="text"
          inputMode="decimal"
          placeholder="e.g. 5"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm tabular-nums"
        />
        <span className="w-4 shrink-0 text-sm text-muted">%</span>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => void submit()}
        className="w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
      >
        {createPortfolio.isPending ? "Creating…" : "Create portfolio"}
      </button>

      {!address && (
        <p className="text-xs text-muted">Connect a wallet to create a portfolio.</p>
      )}
      {feedback && <p className="text-xs text-muted">{feedback}</p>}
    </div>
  );
}
