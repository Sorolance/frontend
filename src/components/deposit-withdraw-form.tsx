"use client";

import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useDeposit, useWithdraw } from "@/hooks/use-vault";
import { ASSETS, type AssetSymbol } from "@/lib/stellar/config";
import { toStroops } from "@/lib/format";

export function DepositWithdrawForm({ vaultAddress }: { vaultAddress?: string } = {}) {
  const { address } = useWallet();
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const [asset, setAsset] = useState<AssetSymbol>("XLM");
  const [amount, setAmount] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const busy = deposit.isPending || withdraw.isPending;
  const disabled = !address || !amount || busy;

  async function run(action: "deposit" | "withdraw") {
    if (!address) return;
    setFeedback(null);
    try {
      const stroops = toStroops(amount, ASSETS[asset].decimals);
      if (action === "deposit") {
        await deposit.mutateAsync({
          address,
          asset: ASSETS[asset].contractId,
          amount: stroops,
          vaultAddress,
        });
      } else {
        await withdraw.mutateAsync({
          address,
          asset: ASSETS[asset].contractId,
          amount: stroops,
          vaultAddress,
        });
      }
      setFeedback(`${action === "deposit" ? "Deposited" : "Withdrew"} ${amount} ${asset}.`);
      setAmount("");
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Transaction failed.");
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex gap-2">
        {(Object.keys(ASSETS) as AssetSymbol[]).map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => setAsset(symbol)}
            className={`rounded-full px-3 py-1 text-sm ${
              asset === symbol
                ? "bg-foreground text-background"
                : "border border-border"
            }`}
          >
            {symbol}
          </button>
        ))}
      </div>
      <input
        type="text"
        inputMode="decimal"
        placeholder={`Amount in ${asset}`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => void run("deposit")}
          className="flex-1 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          Deposit
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => void run("withdraw")}
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium disabled:opacity-50"
        >
          Withdraw
        </button>
      </div>
      {!address && (
        <p className="text-xs text-muted">Connect a wallet to deposit or withdraw.</p>
      )}
      {feedback && <p className="text-xs text-muted">{feedback}</p>}
    </div>
  );
}
