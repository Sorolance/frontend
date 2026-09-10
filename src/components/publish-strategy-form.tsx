"use client";

import { useState } from "react";
import { usePublishStrategy } from "@/hooks/use-strategies";
import { useLocale } from "@/lib/i18n/context";

/** Copy strategies, publish half (PROJECT.md differentiator #10) - opt-in
 * only, this button is the only thing that ever calls it. */
export function PublishStrategyForm({ portfolioId }: { portfolioId: string }) {
  const { t } = useLocale();
  const publish = usePublishStrategy();
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function submit() {
    setFeedback(null);
    try {
      await publish.mutateAsync({ portfolioId, name: name.trim() || undefined });
      setFeedback(t.publishStrategyForm.published);
      setName("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : t.publishStrategyForm.publishFailed);
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <p className="text-xs text-muted">{t.publishStrategyForm.help}</p>
      <input
        type="text"
        placeholder={t.publishStrategyForm.namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
      />
      <button
        type="button"
        disabled={publish.isPending}
        onClick={() => void submit()}
        className="w-full rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {publish.isPending ? t.publishStrategyForm.publishing : t.publishStrategyForm.publish}
      </button>
      {feedback && <p className="text-xs text-muted">{feedback}</p>}
    </div>
  );
}
