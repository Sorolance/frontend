"use client";

import Link from "next/link";
import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { CreatePortfolioForm } from "@/components/create-portfolio-form";
import { useWallet } from "@/hooks/use-wallet";
import { usePortfolios } from "@/hooks/use-portfolios";
import { formatBps } from "@/lib/format";

export default function PortfoliosPage() {
  const { address } = useWallet();
  const { data: portfolios, isPending, isError, error } = usePortfolios(address);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/app" className="text-sm font-medium text-muted">
          ← Dashboard
        </Link>
        <ConnectWalletButton />
      </header>

      <h1 className="text-2xl font-semibold">Portfolios</h1>
      <p className="mt-1 text-sm text-muted">
        Each portfolio is its own vault, deployed and owned by your wallet.
      </p>

      <section className="mt-8">
        {!address && (
          <p className="text-sm text-muted">Connect a wallet to see your portfolios.</p>
        )}
        {address && isPending && (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-border/60" />
            ))}
          </div>
        )}
        {address && isError && (
          <p className="text-sm text-muted">
            Couldn&apos;t load portfolios:{" "}
            {error instanceof Error ? error.message : "unknown error"}
          </p>
        )}
        {address && portfolios && portfolios.length === 0 && (
          <p className="text-sm text-muted">No portfolios yet — create one below.</p>
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
                    {formatBps(p.threshold_bps)} drift threshold
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted">Create a portfolio</h2>
        <CreatePortfolioForm />
      </section>
    </div>
  );
}
