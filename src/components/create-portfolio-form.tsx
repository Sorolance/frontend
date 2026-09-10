"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useCreatePortfolio, type NewPortfolioTarget } from "@/hooks/use-portfolios";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { pctToBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];
const EMPTY_WEIGHTS: Record<AssetSymbol, string> = { XLM: "", USDC: "" };

export function CreatePortfolioForm({ onCreated }: { onCreated?: (id: string) => void }) {
  const { address } = useWallet();
  const createPortfolio = useCreatePortfolio();
  const { t } = useLocale();

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
    setFeedback(t.createPortfolioForm.deploying);
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
      setFeedback(t.createPortfolioForm.created);
      setName("");
      setWeights(EMPTY_WEIGHTS);
      onCreated?.(portfolio.id);
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t.createPortfolioForm.createFailed);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="portfolio-name">
          {t.createPortfolioForm.name}
        </label>
        <input
          id="portfolio-name"
          type="text"
          placeholder={t.createPortfolioForm.namePlaceholder}
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
        {t.common.totalMustEqual100((totalBps / 100).toFixed(2))}
      </p>

      <div className="flex items-center gap-3 border-t border-border pt-3">
        <label className="w-14 shrink-0 text-sm font-medium" htmlFor="new-threshold">
          {t.common.drift}
        </label>
        <input
          id="new-threshold"
          type="text"
          inputMode="decimal"
          placeholder={t.common.thresholdPlaceholder}
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
        {createPortfolio.isPending ? t.createPortfolioForm.creating : t.createPortfolioForm.create}
      </button>

      {!address && (
        <p className="text-xs text-muted">{t.createPortfolioForm.connectToCreate}</p>
      )}
      {feedback && <p className="text-xs text-muted">{feedback}</p>}
    </div>
  );
}
