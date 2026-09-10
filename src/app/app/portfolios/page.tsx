"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { CreatePortfolioForm, type CreatePortfolioInitial } from "@/components/create-portfolio-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolios } from "@/hooks/use-portfolios";
import { useStrategyTemplate } from "@/hooks/use-strategies";
import { formatBps } from "@/lib/format";
import { symbolFor, type AssetSymbol } from "@/lib/stellar/config";
import { useLocale } from "@/lib/i18n/context";

/** Reads `?template=<id>` (if present) and prefills `CreatePortfolioForm`
 * from it - split out from the page so only this part needs the
 * `useSearchParams` Suspense boundary Next.js requires for a statically
 * prerendered page (see the "Create a portfolio" section below). */
function CreatePortfolioSection() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get("template") ?? undefined;
  const { data: template } = useStrategyTemplate(templateId);

  let initial: CreatePortfolioInitial | undefined;
  if (template) {
    const weights: Partial<Record<AssetSymbol, string>> = {};
    for (const target of template.targets) {
      const symbol = symbolFor(target.asset);
      if (symbol) weights[symbol] = (target.weight_bps / 100).toString();
    }
    initial = { name: template.name, thresholdBps: template.threshold_bps, weights };
  }

  return (
    <CreatePortfolioForm key={template ? `template-${template.id}` : "blank"} initial={initial} />
  );
}

export default function PortfoliosPage() {
  const { address } = useWallet();
  const { data: portfolios, isPending, isError, error } = usePortfolios(address);
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app" className="text-sm font-medium text-muted">
          {t.nav.backToDashboard}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </header>

      <h1 className="text-2xl font-semibold">{t.portfolios.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.portfolios.subtitle}</p>

      <section className="mt-8">
        {!address && <p className="text-sm text-muted">{t.portfolios.connectToSee}</p>}
        {address && isPending && (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-border/60" />
            ))}
          </div>
        )}
        {address && isError && (
          <p className="text-sm text-muted">
            {t.portfolios.loadError(error instanceof Error ? error.message : t.common.unknownError)}
          </p>
        )}
        {address && portfolios && portfolios.length === 0 && (
          <p className="text-sm text-muted">{t.portfolios.empty}</p>
        )}
        {address && portfolios && portfolios.length > 0 && (
          <ul className="space-y-2">
            {portfolios.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/app/portfolios/${p.id}`}
                  className="block rounded-lg border border-border p-4 hover:bg-border/30"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted">
                    {t.portfolios.driftThreshold(formatBps(p.threshold_bps))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-muted">{t.portfolios.createSection}</h2>
          <Link href="/app/strategies" className="text-sm font-medium text-muted">
            {t.nav.browseStrategies}
          </Link>
        </div>
        <Suspense fallback={null}>
          <CreatePortfolioSection />
        </Suspense>
      </section>
    </div>
  );
}
