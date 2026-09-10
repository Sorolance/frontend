"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { CreatePortfolioForm } from "@/components/create-portfolio-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolios } from "@/hooks/use-portfolios";
import { formatBps } from "@/lib/format";
import { useLocale } from "@/lib/i18n/context";

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
        <h2 className="mb-3 text-sm font-medium text-muted">{t.portfolios.createSection}</h2>
        <CreatePortfolioForm />
      </section>
    </div>
  );
}
