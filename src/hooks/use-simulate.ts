"use client";

import { useMutation } from "@tanstack/react-query";
import { contract, networks as vaultNetworks } from "@/contracts/vault";
import type { Asset } from "@/contracts/vault";
import { getOracleAdapterClient } from "@/lib/stellar/contracts";
import { RPC_URL } from "@/lib/stellar/config";
import type { ApiTarget } from "@/lib/api/portfolios";
import * as api from "@/lib/api/simulate";
import type { SimulateResponse } from "@/lib/api/simulate";

function toOracleAsset(t: ApiTarget): Asset {
  return t.price_asset_kind === "stellar"
    ? { tag: "Stellar", values: [t.price_asset_value] }
    : { tag: "Other", values: [t.price_asset_value] };
}

/** A target's held token is always a Stellar Asset Contract (see
 * `stellar/config.ts`'s `ASSETS`), so `contract.Client.from` resolves the
 * built-in SAC spec rather than downloading Wasm - no generated binding
 * needed just to read `balance`, which (per the SAC spec) returns a plain
 * `i128`, not a `Result`, unlike this project's own hand-written contracts. */
async function readBalance(assetContractId: string, vaultAddress: string): Promise<bigint> {
  const token = await contract.Client.from<{
    balance: (args: { id: string }) => Promise<{ result: bigint }>;
  }>({
    contractId: assetContractId,
    networkPassphrase: vaultNetworks.testnet.networkPassphrase,
    rpcUrl: RPC_URL,
  });
  const tx = await token.balance({ id: vaultAddress });
  return tx.result;
}

/**
 * What-if stress simulator (PROJECT.md differentiator #9), frontend half.
 * Reads each target's live vault balance and oracle price directly from
 * chain - the same two inputs `rebalancer-scheduler` reads every tick -
 * then posts them plus the caller's per-asset shocks (bps) to
 * `rebalancer-api`'s `/simulate`, which projects drift/trades using the
 * exact same `rebalancer_core` functions the scheduler runs live. Nothing
 * here executes a trade or requires a connected wallet - every read is a
 * simulated, unsigned contract call.
 */
export function useSimulatePortfolio(
  portfolioId: string,
  vaultAddress: string,
  targets: ApiTarget[],
) {
  return useMutation({
    mutationFn: async (shocks: Record<string, number>): Promise<SimulateResponse> => {
      const balances: Record<string, string> = {};
      const prices: Record<string, string> = {};

      for (const target of targets) {
        const [balance, priceTx] = await Promise.all([
          readBalance(target.asset, vaultAddress),
          getOracleAdapterClient().get_price({ asset: toOracleAsset(target) }),
        ]);
        balances[target.asset] = balance.toString();
        prices[target.asset] = priceTx.result.unwrap().toString();
      }

      return api.simulatePortfolio(portfolioId, { balances, prices, shocks });
    },
  });
}
