"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { Client as VaultClient, networks as vaultNetworks } from "@/contracts/vault";
import type { Asset } from "@/contracts/vault";
import {
  RPC_URL,
  ORACLE_ADAPTER_CONTRACT_ID,
  KEEPER_ADDRESS,
  VAULT_WASM_HASH,
} from "@/lib/stellar/config";
import * as api from "@/lib/api/portfolios";
import type { ApiPortfolio, ApiTarget } from "@/lib/api/portfolios";

const PORTFOLIOS_QUERY_KEY = ["portfolios"] as const;

export function usePortfolios(ownerAddress: string | undefined) {
  return useQuery<ApiPortfolio[]>({
    queryKey: [...PORTFOLIOS_QUERY_KEY, "list", ownerAddress],
    queryFn: () => api.listPortfolios(ownerAddress as string),
    enabled: Boolean(ownerAddress),
  });
}

export function usePortfolio(id: string | undefined) {
  return useQuery<ApiPortfolio>({
    queryKey: [...PORTFOLIOS_QUERY_KEY, "detail", id],
    queryFn: () => api.getPortfolio(id as string),
    enabled: Boolean(id),
  });
}

export type NewPortfolioTarget = {
  asset: string;
  priceAsset: Asset;
  weightBps: number;
};

function targetKind(priceAsset: Asset): "stellar" | "other" {
  return priceAsset.tag === "Stellar" ? "stellar" : "other";
}

/**
 * Deploys a brand-new `vault` instance from the connected wallet,
 * `initialize`s it with the given targets/threshold, authorizes the
 * shared backend keeper via `set_keeper`, then registers the result with
 * `rebalancer-api` - four sequential steps, the first three each
 * requiring the wallet's own signature (see PROJECT.md's sub-portfolios
 * note). Registration is deliberately last: a vault only shows up in the
 * dashboard once it's fully live and keeper-authorized on-chain, never
 * mid-setup.
 */
export function useCreatePortfolio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      address,
      name,
      thresholdBps,
      targets,
    }: {
      address: string;
      name: string;
      thresholdBps: number;
      targets: NewPortfolioTarget[];
    }) => {
      const deployTx = await VaultClient.deploy({
        networkPassphrase: vaultNetworks.testnet.networkPassphrase,
        rpcUrl: RPC_URL,
        publicKey: address,
        signTransaction: StellarWalletsKit.signTransaction,
        wasmHash: VAULT_WASM_HASH,
      });
      const deployed = await deployTx.signAndSend();
      const vault = deployed.result;
      const vaultAddress = vault.options.contractId;

      const initTx = await vault.initialize({
        owner: address,
        oracle_adapter: ORACLE_ADAPTER_CONTRACT_ID,
        targets: targets.map((t) => ({
          asset: t.asset,
          price_asset: t.priceAsset,
          weight_bps: t.weightBps,
        })),
        threshold_bps: thresholdBps,
      });
      (await initTx.signAndSend()).result.unwrap();

      const keeperTx = await vault.set_keeper({ keeper: KEEPER_ADDRESS });
      (await keeperTx.signAndSend()).result.unwrap();

      const apiTargets: ApiTarget[] = targets.map((t) => ({
        asset: t.asset,
        price_asset_kind: targetKind(t.priceAsset),
        price_asset_value: t.priceAsset.values[0],
        weight_bps: t.weightBps,
      }));

      return api.createPortfolio({
        vault_address: vaultAddress,
        owner_address: address,
        name,
        threshold_bps: thresholdBps,
        targets: apiTargets,
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PORTFOLIOS_QUERY_KEY });
    },
  });
}
