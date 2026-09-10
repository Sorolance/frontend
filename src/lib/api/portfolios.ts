import { API_URL } from "./config";

/** Mirrors `backend/crates/api`'s `TargetResponse`/`NewTargetRequest` -
 * `price_asset_kind` is `"stellar" | "other"`, matching the DB's own
 * CHECK constraint (see `crates/db/migrations/*_create_targets.up.sql`). */
export type ApiTarget = {
  asset: string;
  price_asset_kind: string;
  price_asset_value: string;
  weight_bps: number;
};

/** Mirrors `backend/crates/api`'s `PortfolioResponse`. */
export type ApiPortfolio = {
  id: string;
  vault_address: string;
  owner_address: string;
  name: string;
  strategy_type: string;
  threshold_bps: number;
  targets: ApiTarget[];
};

/** Carries the API's own JSON `{"error": "..."}` message through, rather
 * than a generic "response not ok". */
export class ApiError extends Error {}

async function handle<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : `request failed with ${response.status}`;
    throw new ApiError(message);
  }
  return response.json() as Promise<T>;
}

export async function listPortfolios(ownerAddress: string): Promise<ApiPortfolio[]> {
  const response = await fetch(
    `${API_URL}/portfolios?owner_address=${encodeURIComponent(ownerAddress)}`,
  );
  return handle(response);
}

export async function getPortfolio(id: string): Promise<ApiPortfolio> {
  const response = await fetch(`${API_URL}/portfolios/${encodeURIComponent(id)}`);
  return handle(response);
}

export type CreatePortfolioRequest = {
  vault_address: string;
  owner_address: string;
  name: string;
  threshold_bps: number;
  targets: ApiTarget[];
};

/** Registers a portfolio whose vault the caller has *already* deployed,
 * `initialize`d, and authorized the shared keeper on (see
 * `@/hooks/use-portfolios`'s `useCreatePortfolio`, which does all three
 * before calling this). This never touches the chain itself. */
export async function createPortfolio(req: CreatePortfolioRequest): Promise<ApiPortfolio> {
  const response = await fetch(`${API_URL}/portfolios`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(req),
  });
  return handle(response);
}

/** A plain downloadable URL, not a fetch wrapper - meant for an `<a
 * href>`/`download` link so the browser handles the CSV response's
 * `Content-Disposition` itself. */
export function reportCsvUrl(id: string): string {
  return `${API_URL}/portfolios/${encodeURIComponent(id)}/report.csv`;
}
