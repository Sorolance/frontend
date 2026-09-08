import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-3 text-sm font-medium text-muted">Stellar · Soroban</p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Automated portfolio rebalancing, on-chain
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Set a target allocation and a drift threshold. Your Soroban vault holds
        the funds - never a custodian, never this app - and rebalances only
        when it drifts past the threshold you set.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/app"
          className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
        >
          Open dashboard
        </Link>
      </div>
      <p className="mt-6 text-xs text-muted">
        Currently live on Stellar testnet. Not audited - do not use with
        mainnet funds.
      </p>
    </div>
  );
}
