"use client";

import { useReducer } from "react";
import type { AssetSymbol } from "@/lib/stellar/config";
import {
  INITIAL_DEMO_STATE,
  computeDemoAllocation,
  demoNeedsRebalance,
  demoRebalance,
  type DemoState,
} from "@/lib/demo/simulate";

type Action =
  | { type: "deposit"; symbol: AssetSymbol; amount: number }
  | { type: "withdraw"; symbol: AssetSymbol; amount: number }
  | { type: "shockPrice"; symbol: AssetSymbol; pct: number }
  | { type: "setTargets"; targets: Record<AssetSymbol, number>; thresholdBps: number }
  | { type: "rebalance" }
  | { type: "reset" };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "deposit":
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.symbol]: state.balances[action.symbol] + action.amount,
        },
      };
    case "withdraw":
      return {
        ...state,
        balances: {
          ...state.balances,
          [action.symbol]: Math.max(0, state.balances[action.symbol] - action.amount),
        },
      };
    case "shockPrice":
      return {
        ...state,
        prices: {
          ...state.prices,
          [action.symbol]: Math.max(0, state.prices[action.symbol] * (1 + action.pct / 100)),
        },
      };
    case "setTargets":
      return { ...state, targets: action.targets, thresholdBps: action.thresholdBps };
    case "rebalance":
      return demoRebalance(state);
    case "reset":
      return INITIAL_DEMO_STATE;
  }
}

/** No wallet, no chain, no backend - this is a `useReducer` over
 * `lib/demo/simulate`'s pure functions, entirely in-memory. Resets on
 * page reload by design; there's no requirement that a demo persist, and
 * skipping localStorage sidesteps SSR/hydration mismatches for free. */
export function useDemoPortfolio() {
  const [state, dispatch] = useReducer(reducer, INITIAL_DEMO_STATE);
  return {
    state,
    allocation: computeDemoAllocation(state),
    needsRebalance: demoNeedsRebalance(state),
    deposit: (symbol: AssetSymbol, amount: number) =>
      dispatch({ type: "deposit", symbol, amount }),
    withdraw: (symbol: AssetSymbol, amount: number) =>
      dispatch({ type: "withdraw", symbol, amount }),
    shockPrice: (symbol: AssetSymbol, pct: number) =>
      dispatch({ type: "shockPrice", symbol, pct }),
    setTargets: (targets: Record<AssetSymbol, number>, thresholdBps: number) =>
      dispatch({ type: "setTargets", targets, thresholdBps }),
    rebalance: () => dispatch({ type: "rebalance" }),
    reset: () => dispatch({ type: "reset" }),
  };
}
