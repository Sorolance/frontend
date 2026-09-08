"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getVaultClient } from "@/lib/stellar/contracts";
import type { AllocationEntry, TargetWeight } from "@/contracts/vault";

const VAULT_QUERY_KEY = ["vault"] as const;

/** Live per-asset allocation vs. target, read directly from the deployed
 * testnet vault contract - no wallet connection required, this is a
 * read-only simulated call. */
export function useAllocation() {
  return useQuery<AllocationEntry[]>({
    queryKey: [...VAULT_QUERY_KEY, "allocation"],
    queryFn: async () => {
      const tx = await getVaultClient().compute_allocation();
      return tx.result.unwrap();
    },
    refetchInterval: 30_000,
  });
}

export function useNeedsRebalance() {
  return useQuery<boolean>({
    queryKey: [...VAULT_QUERY_KEY, "needsRebalance"],
    queryFn: async () => {
      const tx = await getVaultClient().needs_rebalance();
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
    }: {
      address: string;
      asset: string;
      amount: bigint;
    }) => {
      const client = getVaultClient({ publicKey: address });
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
    }: {
      address: string;
      targets: TargetWeight[];
      thresholdBps: number;
    }) => {
      const client = getVaultClient({ publicKey: address });
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
    }: {
      address: string;
      asset: string;
      amount: bigint;
    }) => {
      const client = getVaultClient({ publicKey: address });
      const tx = await client.withdraw({ to: address, asset, amount });
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: VAULT_QUERY_KEY });
    },
  });
}
