"use client";

import { useState } from "react";
import { useCreateWebhook } from "@/hooks/use-webhooks";
import { useLocale } from "@/lib/i18n/context";

/** The exact two event types `rebalancer-scheduler::notifications`
 * dispatches - see `backend/crates/scheduler/src/notifications.rs`. Not
 * enforced by the API itself (any string is accepted), just what this form
 * offers since they're the only ones anything will ever send. */
const EVENT_TYPES = ["rebalance.completed", "risk.circuit_breaker_tripped"] as const;

/** External trigger webhooks (PROJECT.md differentiator #8), registration
 * half - `rebalancer-api` has no list/read-back endpoint, so this form is
 * the entire frontend surface for webhooks: register once, copy the secret
 * shown in the response, done. */
export function WebhookForm({ portfolioId }: { portfolioId: string }) {
  const { t } = useLocale();
  const createWebhook = useCreateWebhook();
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  function toggle(eventType: string) {
    setSelected((prev) => ({ ...prev, [eventType]: !prev[eventType] }));
  }

  async function submit() {
    setError(null);
    try {
      await createWebhook.mutateAsync({
        portfolioId,
        url: url.trim(),
        eventTypes: EVENT_TYPES.filter((eventType) => selected[eventType]),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.webhookForm.registerFailed);
    }
  }

  const eventLabel: Record<(typeof EVENT_TYPES)[number], string> = {
    "rebalance.completed": t.webhookForm.eventRebalanceCompleted,
    "risk.circuit_breaker_tripped": t.webhookForm.eventCircuitBreakerTripped,
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-xs text-muted">{t.webhookForm.help}</p>
      <input
        type="text"
        placeholder={t.webhookForm.urlPlaceholder}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
      />
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted">{t.webhookForm.eventTypes}</p>
        {EVENT_TYPES.map((eventType) => (
          <label key={eventType} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(selected[eventType])}
              onChange={() => toggle(eventType)}
            />
            {eventLabel[eventType]}
          </label>
        ))}
      </div>
      <button
        type="button"
        disabled={!url.trim() || createWebhook.isPending}
        onClick={() => void submit()}
        className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {createWebhook.isPending ? t.webhookForm.registering : t.webhookForm.register}
      </button>
      {error && <p className="text-xs text-status-warning">{error}</p>}
      {createWebhook.data && (
        <div className="space-y-1 rounded-md border border-border p-3 text-xs">
          <p className="font-medium">{t.webhookForm.registered}</p>
          <p className="text-muted">{t.webhookForm.secretLabel}</p>
          <p className="break-all font-mono">{createWebhook.data.secret}</p>
        </div>
      )}
    </div>
  );
}
