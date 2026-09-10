"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AllocationChart } from "@/components/allocation-chart";
import { RebalanceStatus } from "@/components/rebalance-status";
import { DepositWithdrawForm } from "@/components/deposit-withdraw-form";
import { SetTargetsForm } from "@/components/set-targets-form";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLocale } from "@/lib/i18n/context";

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-medium text-muted">
          {t.nav.backToRebalancer}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ConnectWalletButton />
        </div>
      </header>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t.dashboard.title}</h1>
        <Link href="/app/portfolios" className="text-sm font-medium text-muted">
          {t.nav.subPortfolios}
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">{t.dashboard.liveFrom}</p>

      <div className="mt-6">
        <RebalanceStatus />
      </div>

      <section className="mt-8 rounded-lg border border-border p-5">
        <h2 className="mb-4 text-sm font-medium text-muted">{t.common.allocation}</h2>
        <AllocationChart />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">
          {t.common.deposit} / {t.common.withdraw}
        </h2>
        <DepositWithdrawForm />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">{t.common.targetAllocation}</h2>
        <SetTargetsForm />
      </section>
    </div>
  );
}
