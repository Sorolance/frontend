"use client";

import Link from "next/link";
import { useStrategyTemplates } from "@/hooks/use-strategies";
import { formatBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";

/** Copy strategies, browse half (PROJECT.md differentiator #10). "Clone"
 * needs no endpoint of its own - it just links into the create-portfolio
 * flow with this template's id, which prefills the form (see
 * `/app/portfolios/page.tsx`). */
export function StrategyTemplatesList() {
  const { t } = useLocale();
  const { data: templates, isPending, isError, error } = useStrategyTemplates();

  if (isPending) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-border/60" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-muted">
        {t.strategyTemplates.loadError(
          error instanceof Error ? error.message : t.common.unknownError,
        )}
      </p>
    );
  }

  if (templates.length === 0) {
    return <p className="text-sm text-muted">{t.strategyTemplates.empty}</p>;
  }

  return (
    <ul className="space-y-2">
      {templates.map((template) => (
        <li
          key={template.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
        >
          <div>
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-muted">
              {t.portfolios.driftThreshold(formatBps(template.threshold_bps))}
            </p>
          </div>
          <Link
            href={`/app/portfolios?template=${template.id}`}
            className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium"
          >
            {t.strategyTemplates.clone}
          </Link>
        </li>
      ))}
    </ul>
  );
}
