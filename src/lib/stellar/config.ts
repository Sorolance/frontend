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

/** The `oracle_adapter` every sub-portfolio's vault is initialized
 * against - one shared instance, same as the default vault uses. */
export const ORACLE_ADAPTER_CONTRACT_ID =
  "CA3RFMJ4BQ3G7OH5MJKZE56VCHY7NFQASAJN2CYNEZBM4NL76SNBBY5E";

/** The shared backend keeper's address (mirrors `backend/.env.example`'s
 * `KEEPER_ADDRESS`) - authorized via `set_keeper` on every newly deployed
 * sub-portfolio vault so `rebalancer-scheduler` can drive it. Public by
 * design: a keeper key can only ever call `rebalance`, never withdraw or
 * reconfigure (see PROJECT.md's execution-model decision). */
export const KEEPER_ADDRESS =
  "GCDIR3ZXHY7VNUL35BWZMBWDSHGC6LW3E4PRHH6ONBJI3UJIX4QVSK6Q";

/** SHA-256 hash of the `vault` contract's Wasm, already installed on
 * testnet by the very first vault deploy (`stellar contract info hash
 * --id <VAULT_CONTRACT_ID> --network testnet`). Reused to deploy each new
 * sub-portfolio's own vault instance without re-uploading the same Wasm. */
export const VAULT_WASM_HASH =
  "f43273a83ef0aabdb9916ecc3b6f0169a73d3ba787d5c73b7dc7f1760f7f239c";
