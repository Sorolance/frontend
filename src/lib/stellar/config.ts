import type { Asset } from "@/contracts/vault";

/**
 * Testnet configuration matching the Phase 0 deployment recorded in
 * PROJECT.md. All addresses here are real, deployed, and verified working
 * (see the contracts repo history) - not placeholders.
 */

export const RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

/** The vault's two configured target assets (60% XLM / 40% USDC, 5% threshold). */
export const ASSETS = {
  XLM: {
    label: "XLM",
    /** Native XLM's Stellar Asset Contract address on testnet. */
    contractId: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    decimals: 7,
    /**
     * The oracle's own pricing key for this asset - deliberately separate
     * from `contractId` (see `TargetWeight.price_asset` in the vault
     * contract): Reflector's live feeds price majors by symbol, not by
     * the Stellar contract address that actually holds the balance.
     */
    priceAsset: { tag: "Other", values: ["XLM"] } as Asset,
  },
  USDC: {
    label: "USDC",
    /** Circle's testnet USDC issuer, wrapped as a SAC. */
    contractId: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
    decimals: 7,
    priceAsset: { tag: "Other", values: ["USDC"] } as Asset,
  },
} as const;

export type AssetSymbol = keyof typeof ASSETS;
