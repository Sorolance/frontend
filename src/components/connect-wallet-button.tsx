"use client";

import { useWallet } from "@/hooks/use-wallet";
import { useLocale } from "@/lib/i18n/context";

function truncateAddress(address: string): string {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectWalletButton() {
  const { address, connecting, connect, disconnect } = useWallet();
  const { t } = useLocale();

  if (address) {
    return (
      <button
        type="button"
        onClick={() => void disconnect()}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface-raised"
        title={t.common.disconnectWallet}
      >
        {truncateAddress(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => void connect()}
      disabled={connecting}
      className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity disabled:opacity-50"
    >
      {connecting ? t.common.connecting : t.common.connectWallet}
    </button>
  );
}
