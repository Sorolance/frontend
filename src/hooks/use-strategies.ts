"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api/strategies";
import type { ApiStrategyTemplate } from "@/lib/api/strategies";

const STRATEGY_TEMPLATES_QUERY_KEY = ["strategy-templates"] as const;

/** Every published template, newest first - see
 * `rebalancer-api::list_strategies`'s doc comment for the anonymization
 * guarantee (no owner/vault/portfolio identifier ever included). */
export function useStrategyTemplates() {
  return useQuery<ApiStrategyTemplate[]>({
    queryKey: [...STRATEGY_TEMPLATES_QUERY_KEY, "list"],
    queryFn: api.listStrategyTemplates,
  });
}

export function useStrategyTemplate(id: string | undefined) {
  return useQuery<ApiStrategyTemplate>({
    queryKey: [...STRATEGY_TEMPLATES_QUERY_KEY, "detail", id],
    queryFn: () => api.getStrategyTemplate(id as string),
    enabled: Boolean(id),
  });
}

export function usePublishStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ portfolioId, name }: { portfolioId: string; name?: string }) =>
      api.publishStrategy(portfolioId, name),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: STRATEGY_TEMPLATES_QUERY_KEY });
    },
  });
}
