"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemoPortfolio } from "@/hooks/use-demo";
import { AllocationBars } from "@/components/allocation-bars";
import { DemoActions } from "@/components/demo-actions";
import { DemoTargetsForm } from "@/components/demo-targets-form";
import { ASSETS } from "@/lib/stellar/config";
import { formatBps } from "@/lib/format";

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function DemoPage() {
  const demo = useDemoPortfolio();
  // Bumped on reset so DemoTargetsForm remounts and re-reads its initial
  // values from the (now reset) targets, rather than showing stale input.
  const [generation, setGeneration] = useState(0);

  const totalValue = demo.allocation.reduce((sum, entry) => {
    const symbolTotal =
      demo.state.balances[entry.symbol] * demo.state.prices[entry.symbol];
    return sum + symbolTotal;
  }, 0);

  const statusColor = demo.needsRebalance
    ? "var(--color-status-warning)"
    : "var(--color-status-good)";
  const statusLabel = demo.needsRebalance
    ? "Drift exceeds threshold - rebalance needed"
    : "On target";

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted">
          ← Rebalancer
        </Link>
        <Link
          href="/app"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-raised"
        >
          Open live dashboard
        </Link>
      </header>

      <div className="mb-6 rounded-lg border border-border bg-surface-raised p-3 text-sm text-muted">
        Demo mode - a simulated ${(10_000).toLocaleString("en-US")} portfolio.
        No wallet, no real funds, nothing here touches the deployed vault.
        Deposit/withdraw and price moves are all local to this page.
      </div>

      <h1 className="text-2xl font-semibold">Portfolio</h1>
      <p className="mt-1 text-sm text-muted">{formatUsd(totalValue)} total</p>

      <div className="mt-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          {statusLabel}
        </span>
      </div>

      <section className="mt-8 rounded-lg border border-border p-5">
        <h2 className="mb-4 text-sm font-medium text-muted">Allocation</h2>
        <AllocationBars
          entries={demo.allocation.map((entry) => ({
            key: entry.symbol,
            label: entry.symbol,
            current_weight_bps: entry.current_weight_bps,
            target_weight_bps: entry.target_weight_bps,
            drift_bps: entry.drift_bps,
          }))}
        />
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-xs text-muted">
          {(Object.keys(ASSETS) as (keyof typeof ASSETS)[]).map((symbol) => (
            <div key={symbol}>
              <dt className="font-medium text-foreground">{symbol}</dt>
              <dd>
                {demo.state.balances[symbol].toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                @ {formatUsd(demo.state.prices[symbol])} ={" "}
                {formatUsd(demo.state.balances[symbol] * demo.state.prices[symbol])}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Deposit / withdraw / simulate
        </h2>
        <DemoActions
          onDeposit={demo.deposit}
          onWithdraw={demo.withdraw}
          onShockPrice={demo.shockPrice}
          onRebalance={demo.rebalance}
          onReset={() => {
            demo.reset();
            setGeneration((g) => g + 1);
          }}
        />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">Target allocation</h2>
        <DemoTargetsForm
          key={generation}
          targets={demo.state.targets}
          thresholdBps={demo.state.thresholdBps}
          onSubmit={demo.setTargets}
        />
      </section>

      <p className="mt-6 text-center text-xs text-muted">
        Current threshold: {formatBps(demo.state.thresholdBps)}
      </p>
    </div>
  );
}
