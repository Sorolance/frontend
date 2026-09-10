import { API_URL } from "./config";
import { handle } from "./portfolios";

export type CreateWebhookRequest = {
  url: string;
  event_types: string[];
};

/** Mirrors `backend/crates/api`'s `WebhookResponse` - `secret` is only ever
 * present in this one response; losing it means registering a new webhook,
 * not recovering the old one (see the handler's own doc comment). */
export type ApiWebhook = {
  id: string;
  url: string;
  event_types: string[];
  secret: string;
};

export async function createWebhook(
  portfolioId: string,
  req: CreateWebhookRequest,
): Promise<ApiWebhook> {
  const response = await fetch(
    `${API_URL}/portfolios/${encodeURIComponent(portfolioId)}/webhooks`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
    },
  );
  return handle(response);
}
