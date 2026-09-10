import { API_URL } from "./config";
import { handle } from "./portfolios";

/** Mirrors `backend/crates/api`'s `SimulateRequest` - `balances`/`prices`
 * are keyed by each target's `asset` (the vault-held token's contract id,
 * same key `GET /portfolios/:id`'s `targets[].asset` uses), each an `i128`
 * stringified for JSON-safety. `shocks` (bps, signed) uses the same keys
 * and may omit any asset left at its live price. */
export type SimulateRequest = {
  balances: Record<string, string>;
  prices: Record<string, string>;
  shocks: Record<string, number>;
};

export type SimulatedAllocationEntry = {
  asset: string;
  target_weight_bps: number;
  current_weight_bps: number;
  drift_bps: number;
};

/** `asset_in` is the overweight (source) asset being sold, `asset_out` the
 * underweight (sink) asset being bought - see `rebalancer_core::TradeIntent`'s
 * doc comment. `amount_in` is the source asset's smallest-unit amount. */
export type SimulatedTrade = {
  asset_in: string;
  asset_out: string;
  amount_in: string;
};

export type SimulateResponse = {
  needs_rebalance: boolean;
  allocation: SimulatedAllocationEntry[];
  trades: SimulatedTrade[];
};

export async function simulatePortfolio(
  portfolioId: string,
  req: SimulateRequest,
): Promise<SimulateResponse> {
  const response = await fetch(
    `${API_URL}/portfolios/${encodeURIComponent(portfolioId)}/simulate`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    },
  );
  return handle(response);
}
