import { API_URL } from "./config";
import { handle } from "./portfolios";

export type ApiStrategyTemplateTarget = {
  asset: string;
  price_asset_kind: string;
  price_asset_value: string;
  weight_bps: number;
};

/** Mirrors `backend/crates/api`'s `StrategyTemplateResponse`. Never carries
 * `portfolio_id`/`vault_address`/`owner_address` - the anonymization is
 * structural on the backend's side (see `rebalancer-api::publish_strategy`'s
 * doc comment), not just an omitted field here. */
export type ApiStrategyTemplate = {
  id: string;
  name: string;
  threshold_bps: number;
  targets: ApiStrategyTemplateTarget[];
  created_at: string;
};

export async function listStrategyTemplates(): Promise<ApiStrategyTemplate[]> {
  const response = await fetch(`${API_URL}/strategy-templates`);
  return handle(response);
}

export async function getStrategyTemplate(id: string): Promise<ApiStrategyTemplate> {
  const response = await fetch(`${API_URL}/strategy-templates/${encodeURIComponent(id)}`);
  return handle(response);
}

/** Snapshots a portfolio's current targets/threshold into a new public
 * template - opt-in only, never called automatically. `name` overrides the
 * published template's name (defaults server-side to the portfolio's own
 * name), which matters for anonymization: a portfolio's own name can be
 * identifying in a way a template name doesn't need to be. */
export async function publishStrategy(
  portfolioId: string,
  name?: string,
): Promise<ApiStrategyTemplate> {
  const response = await fetch(
    `${API_URL}/portfolios/${encodeURIComponent(portfolioId)}/publish-strategy`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    },
  );
  return handle(response);
}
