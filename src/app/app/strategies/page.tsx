"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { StrategyTemplatesList } from "@/components/strategy-templates-list";
import { useLocale } from "@/lib/i18n/context";

export default function StrategyTemplatesPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/app/portfolios" className="text-sm font-medium text-muted">
          {t.nav.backToPortfolios}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </header>

      <h1 className="text-2xl font-semibold">{t.strategyTemplates.title}</h1>
      <p className="mt-1 text-sm text-muted">{t.strategyTemplates.subtitle}</p>

      <section className="mt-8">
        <StrategyTemplatesList />
      </section>
    </div>
  );
}
