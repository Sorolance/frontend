"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVaultClient } from "@/lib/stellar/contracts";
import type { AllocationEntry, TargetWeight } from "@/contracts/vault";

const VAULT_QUERY_KEY = ["vault"] as const;

/** Live per-asset allocation vs. target, read directly from the deployed
 * testnet vault contract - no wallet connection required, this is a
 * read-only simulated call. `vaultAddress` defaults to the hardcoded
 * demo/legacy vault; pass a sub-portfolio's own address to read that one
 * instead. */
export function useAllocation(vaultAddress?: string) {
  return useQuery<AllocationEntry[]>({
    queryKey: [...VAULT_QUERY_KEY, vaultAddress ?? "default", "allocation"],
    queryFn: async () => {
      const tx = await getVaultClient(undefined, vaultAddress).compute_allocation();
      return tx.result.unwrap();
    },
    refetchInterval: 30_000,
  });
}

export function useNeedsRebalance(vaultAddress?: string) {
  return useQuery<boolean>({
    queryKey: [...VAULT_QUERY_KEY, vaultAddress ?? "default", "needsRebalance"],
    queryFn: async () => {
      const tx = await getVaultClient(undefined, vaultAddress).needs_rebalance();
      return tx.result.unwrap();
    },
    refetchInterval: 30_000,
  });
}

export function useDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      address,
      asset,
      amount,
      vaultAddress,
    }: {
      address: string;
      asset: string;
      amount: bigint;
      vaultAddress?: string;
    }) => {
      const client = getVaultClient({ publicKey: address }, vaultAddress);
      const tx = await client.deposit({ from: address, asset, amount });
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEY });
    },
  });
}

/** Owner-only on-chain (`vault::set_targets` calls `owner.require_auth()`)
 * - same as withdraw, this form doesn't hide itself from non-owner
 *   wallets, it just surfaces whatever error the contract/wallet gives
 *   back on submit. */
export function useSetTargets() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      address,
      targets,
      thresholdBps,
      vaultAddress,
    }: {
      address: string;
      targets: TargetWeight[];
      thresholdBps: number;
      vaultAddress?: string;
    }) => {
      const client = getVaultClient({ publicKey: address }, vaultAddress);
      const tx = await client.set_targets({
        targets,
        threshold_bps: thresholdBps,
      });
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEY });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      address,
      asset,
      amount,
      vaultAddress,
    }: {
      address: string;
      asset: string;
      amount: bigint;
      vaultAddress?: string;
    }) => {
      const client = getVaultClient({ publicKey: address }, vaultAddress);
      const tx = await client.withdraw({ to: address, asset, amount });
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEY });
    },
  });
}
