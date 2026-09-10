"use client";

import { use } from "react";
import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AllocationChart } from "@/components/allocation-chart";
import { RebalanceStatus } from "@/components/rebalance-status";
import { DepositWithdrawForm } from "@/components/deposit-withdraw-form";
import { SetTargetsForm } from "@/components/set-targets-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { usePortfolio } from "@/hooks/use-portfolios";
import { reportCsvUrl } from "@/lib/api/portfolios";
import { useLocale } from "@/lib/i18n/context";

export default function PortfolioDetailPage({
  params,
}: PageProps<"/app/portfolios/[id]">) {
  const { id } = use(params);
  const { data: portfolio, isPending, isError, error } = usePortfolio(id);
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

      {isPending && <div className="h-8 w-48 animate-pulse rounded bg-border/60" />}
      {isError && (
        <p className="text-sm text-muted">
          {t.portfolioDetail.loadError(error instanceof Error ? error.message : t.common.unknownError)}
        </p>
      )}

      {portfolio && (
        <>
          <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {t.portfolioDetail.vaultAddress(
              `${portfolio.vault_address.slice(0, 6)}…${portfolio.vault_address.slice(-6)}`,
            )}
          </p>

          <div className="mt-6">
            <RebalanceStatus vaultAddress={portfolio.vault_address} />
          </div>

          <section className="mt-8 rounded-lg border border-border p-5">
            <h2 className="mb-4 text-sm font-medium text-muted">{t.common.allocation}</h2>
            <AllocationChart vaultAddress={portfolio.vault_address} />
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-muted">
              {t.common.deposit} / {t.common.withdraw}
            </h2>
            <DepositWithdrawForm vaultAddress={portfolio.vault_address} />
          </section>

          <section className="mt-6">
            <h2 className="mb-3 text-sm font-medium text-muted">{t.common.targetAllocation}</h2>
            <SetTargetsForm vaultAddress={portfolio.vault_address} />
          </section>

          <section className="mt-6">
            <a
              href={reportCsvUrl(portfolio.id)}
              className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium"
            >
              {t.portfolioDetail.downloadAuditLog}
            </a>
          </section>
        </>
      )}
    </div>
  );
}
