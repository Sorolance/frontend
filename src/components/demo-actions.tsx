"use client";

import { useState } from "react";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { useLocale } from "@/lib/i18n/context";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];

export function DemoActions({
  onDeposit,
  onWithdraw,
  onShockPrice,
  onRebalance,
  onReset,
}: {
  onDeposit: (symbol: AssetSymbol, amount: number) => void;
  onWithdraw: (symbol: AssetSymbol, amount: number) => void;
  onShockPrice: (symbol: AssetSymbol, pct: number) => void;
  onRebalance: () => void;
  onReset: () => void;
}) {
  const [asset, setAsset] = useState<AssetSymbol>("XLM");
  const [amount, setAmount] = useState("");
  const { t } = useLocale();

  function run(action: "deposit" | "withdraw") {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return;
    (action === "deposit" ? onDeposit : onWithdraw)(asset, n);
    setAmount("");
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <div className="mb-2 flex gap-2">
          {SYMBOLS.map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => setAsset(symbol)}
              className={`rounded-full px-3 py-1 text-sm ${
                asset === symbol ? "bg-foreground text-background" : "border border-border"
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            inputMode="decimal"
            placeholder={t.common.amountIn(asset)}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full min-w-0 rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => run("deposit")}
              className="flex-1 shrink-0 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background sm:flex-none"
            >
              {t.common.deposit}
            </button>
            <button
              type="button"
              onClick={() => run("withdraw")}
              className="flex-1 shrink-0 rounded-md border border-border px-3 py-2 text-sm font-medium sm:flex-none"
            >
              {t.common.withdraw}
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs text-muted">{t.demoActions.shockHelp}</p>
        <div className="flex flex-wrap gap-2">
          {SYMBOLS.flatMap((symbol) =>
            [-20, 20].map((pct) => (
              <button
                key={`${symbol}-${pct}`}
                type="button"
                onClick={() => onShockPrice(symbol, pct)}
                className="rounded-full border border-border px-3 py-1 text-sm"
              >
                {symbol} {pct > 0 ? "+" : ""}
                {pct}%
              </button>
            )),
          )}
        </div>
      </div>

      <div className="flex gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={onRebalance}
          className="flex-1 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          {t.demoActions.rebalanceNow}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium"
        >
          {t.demoActions.resetDemo}
        </button>
      </div>
    </div>
  );
}
