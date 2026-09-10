"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { AllocationChart } from "@/components/allocation-chart";
import { RebalanceStatus } from "@/components/rebalance-status";
import { DepositWithdrawForm } from "@/components/deposit-withdraw-form";
import { SetTargetsForm } from "@/components/set-targets-form";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted">
          ← Rebalancer
        </Link>
        <ConnectWalletButton />
      </header>

      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Portfolio</h1>
        <Link href="/app/portfolios" className="text-sm font-medium text-muted">
          Sub-portfolios →
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted">
        Live from the vault deployed on Stellar testnet.
      </p>

      <div className="mt-6">
        <RebalanceStatus />
      </div>

      <section className="mt-8 rounded-lg border border-border p-5">
        <h2 className="mb-4 text-sm font-medium text-muted">Allocation</h2>
        <AllocationChart />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Deposit / withdraw
        </h2>
        <DepositWithdrawForm />
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-sm font-medium text-muted">
          Target allocation
        </h2>
        <SetTargetsForm />
      </section>
    </div>
  );
}
