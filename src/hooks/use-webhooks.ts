"use client";

import { useMutation } from "@tanstack/react-query";
import * as api from "@/lib/api/webhooks";

/** No list/read-back endpoint exists for webhooks (see
 * `rebalancer-api`'s doc comment: the secret is shown exactly once, at
 * creation) - this is the only webhook operation the frontend can offer. */
export function useCreateWebhook() {
  return useMutation({
    mutationFn: ({
      portfolioId,
      url,
      eventTypes,
    }: {
      portfolioId: string;
      url: string;
      eventTypes: string[];
    }) => api.createWebhook(portfolioId, { url, event_types: eventTypes }),
  });
}
