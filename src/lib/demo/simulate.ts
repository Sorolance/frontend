import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";

const SYMBOLS = Object.keys(ASSETS) as AssetSymbol[];

export interface DemoState {
  /** Token units, not stroops - this is a simulated portfolio, never a
   * real balance, so there's no reason to deal in the on-chain unit. */
  balances: Record<AssetSymbol, number>;
  /** USD per token unit. Not fed by Reflector or any other real feed -
   * "no wallet required" means no live price dependency either, just
   * something a demo visitor can nudge to see drift happen. */
  prices: Record<AssetSymbol, number>;
  targets: Record<AssetSymbol, number>; // weight_bps, sums to 10_000
  thresholdBps: number;
}

/** $10,000 at 60% XLM / 40% USDC, matching the real deployed vault's own
 * default targets (see PROJECT.md) so the demo teaches the same mental
 * model as the live dashboard. */
export const INITIAL_DEMO_STATE: DemoState = {
  balances: { XLM: 50_000, USDC: 4_000 },
  prices: { XLM: 0.12, USDC: 1 },
  targets: { XLM: 6_000, USDC: 4_000 },
  thresholdBps: 500,
};

export interface DemoAllocationEntry {
  symbol: AssetSymbol;
  current_weight_bps: number;
  target_weight_bps: number;
  drift_bps: number;
}

function values(state: DemoState): number[] {
  return SYMBOLS.map((symbol) => state.balances[symbol] * state.prices[symbol]);
}

/** Mirrors `vault::compute_allocation`'s math exactly (see
 * `contracts/contracts/vault/src/lib.rs` and
 * `backend/crates/core/src/lib.rs`): value = balance * price, weight =
 * value / total. Kept identical on purpose so this demo teaches the same
 * mental model as the real thing, not a simplified stand-in for it. */
export function computeDemoAllocation(state: DemoState): DemoAllocationEntry[] {
  const vals = values(state);
  const total = vals.reduce((sum, v) => sum + v, 0);
  return SYMBOLS.map((symbol, i) => {
    const current_weight_bps = total > 0 ? Math.round((vals[i] / total) * 10_000) : 0;
    const target_weight_bps = state.targets[symbol];
    return {
      symbol,
      current_weight_bps,
      target_weight_bps,
      drift_bps: current_weight_bps - target_weight_bps,
    };
  });
}

export function demoNeedsRebalance(state: DemoState): boolean {
  return computeDemoAllocation(state).some(
    (entry) => Math.abs(entry.drift_bps) >= state.thresholdBps,
  );
}

/** Simulates a perfect rebalancing trade: redistributes the portfolio's
 * total value to land exactly on each asset's target weight. The real
 * vault can't actually do this yet either - `rebalance` fails closed with
 * `RouterNotConfigured` until Phase 4 wires a router (see
 * `backend/README.md`) - this is what it *would* do once one exists. */
export function demoRebalance(state: DemoState): DemoState {
  const vals = values(state);
  const total = vals.reduce((sum, v) => sum + v, 0);
  const balances = { ...state.balances };
  for (const symbol of SYMBOLS) {
    const targetValue = (total * state.targets[symbol]) / 10_000;
    balances[symbol] = state.prices[symbol] > 0 ? targetValue / state.prices[symbol] : 0;
  }
  return { ...state, balances };
}
