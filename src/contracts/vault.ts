import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CC2PJBGDJOM4HNGDX5NJY4BNKQ2324PQSLWFDWXQDCFJ7AK6AIRLJ5AC",
  }
} as const

export const Errors = {
  1: {message:"NotInitialized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"InvalidTargets"},
  4: {message:"InvalidThreshold"},
  5: {message:"InvalidAmount"},
  6: {message:"AssetNotInTargets"},
  7: {message:"Paused"},
  8: {message:"Unauthorized"},
  9: {message:"BelowThreshold"},
  10: {message:"RouterNotConfigured"},
  /**
   * A configured `risk_guard` reports the breaker is currently
   * tripped - see `set_risk_guard` and `observe_risk`. Never returned
   * if no `risk_guard` is configured.
   */
  11: {message:"CircuitBreakerTripped"},
  /**
   * A configured `risk_guard` rejected `set_targets` because a single
   * asset's weight exceeds its configured maximum concentration.
   * Never returned if no `risk_guard` is configured.
   */
  12: {message:"ConcentrationLimitExceeded"}
}


export interface TargetWeight {
  /**
 * The token contract actually custodied (deposit/withdraw/balance).
 */
asset: string;
  /**
 * The oracle's key for pricing this asset - not necessarily the same
 * identifier as `asset`. Reflector's live feeds price major assets by
 * symbol (`Asset::Other("XLM")`, `"USDC"`, ...), not by the
 * Stellar contract address that actually holds the balance, so the
 * two must be tracked separately.
 */
price_asset: Asset;
  weight_bps: u32;
}


export interface AllocationEntry {
  asset: string;
  current_weight_bps: u32;
  drift_bps: i32;
  target_weight_bps: u32;
}


export interface TradeInstruction {
  amount_in: i128;
  asset_in: string;
  asset_out: string;
  min_amount_out: i128;
}

/**
 * Matches the Reflector / SEP-40 oracle asset representation.
 */
export type Asset = {tag: "Stellar", values: readonly [string]} | {tag: "Other", values: readonly [string]};


/**
 * Matches the Reflector / SEP-40 oracle price response.
 */
export interface PriceData {
  price: i128;
  timestamp: u64;
}

export const OracleError = {
  1: {message:"NotInitialized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"PriceUnavailable"},
  4: {message:"PriceStale"},
  5: {message:"InvalidPrice"}
}

export const RiskError = {
  1: {message:"NotInitialized"},
  2: {message:"AlreadyInitialized"},
  3: {message:"Unauthorized"},
  4: {message:"InvalidConfig"},
  5: {message:"CircuitBreakerTripped"},
  6: {message:"ConcentrationLimitExceeded"}
}


/**
 * One asset's currently-observed price, as the vault sees it (same
 * value it just got from its own oracle_adapter). `risk_guard` never
 * talks to an oracle directly - it only ever sees what the vault hands
 * it, so there's no third cross-contract hop and no risk of the two
 * disagreeing about which price feed is authoritative.
 */
export interface PriceObservation {
  /**
 * The custodied token address (matches `TargetWeight.asset` in
 * `vault`), not the oracle's pricing key - this is just an opaque
 * identifier to `risk_guard`, used only to key its own
 * last-observed-price memory per asset.
 */
asset: string;
  price: i128;
}

export interface Client {
  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit `amount` of `asset` (must be one of the vault's configured
   * target assets) from `from` into the vault.
   */
  deposit: ({from, asset, amount}: {from: string, asset: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw `amount` of `asset` to `to`. Owner-only.
   */
  withdraw: ({to, asset, amount}: {to: string, asset: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a rebalance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Execute a set of trades to bring the portfolio back to target.
   * Callable by the owner or the configured keeper. Fails closed:
   * - refuses if paused
   * - refuses if drift is below threshold (no-op, no fees burned)
   * - refuses if a configured `risk_guard`'s circuit breaker is
   * tripped (see `observe_risk`) - skipped entirely if none is
   * configured
   * - refuses any trade touching an asset outside the configured
   * targets, so funds can never be routed anywhere but between the
   * vault's own declared assets
   * - refuses if no router is configured
   */
  rebalance: ({caller, trades}: {caller: string, trades: Array<TradeInstruction>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time setup. `targets` weights must sum to 10_000 bps (100%),
   * with no duplicate assets. `threshold_bps` is the per-asset drift
   * (in bps of total portfolio value) that must be exceeded before
   * `rebalance` will do anything.
   * 
   * Note on price math: `compute_allocation` compares assets purely by
   * value ratio, never in absolute terms, so it is correct as long as
   * every target asset shares the same token decimals (true for all
   * Stellar SAC-wrapped assets: 7 decimals) and is priced by the same
   * oracle feed decimals (Reflector reports one `decimals()` for its
   * whole feed). Mixing oracle sources with different decimals per
   * asset would need explicit normalization - out of scope for Phase 0.
   */
  initialize: ({owner, oracle_adapter, targets, threshold_bps}: {owner: string, oracle_adapter: string, targets: Array<TargetWeight>, threshold_bps: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_keeper transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Grant a backend keeper permission to call `rebalance`. The keeper
   * can never call `withdraw`, `set_targets`, `set_router`, or
   * `set_keeper` - those all require the owner's own signature.
   */
  set_keeper: ({keeper}: {keeper: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_paused transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Pausing blocks `deposit` and `rebalance` only. `withdraw` always
   * works, regardless of pause state - users must never be locked out
   * of their own funds.
   */
  set_paused: ({paused}: {paused: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_router transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_router: ({router}: {router: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_targets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_targets: ({targets, threshold_bps}: {targets: Array<TargetWeight>, threshold_bps: u32}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a observe_risk transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Feeds current oracle prices for every target asset into the
   * configured `risk_guard`, so its circuit breaker stays current even
   * when nothing is currently trying to rebalance. Same caller
   * permission as `rebalance` (owner or keeper), since in practice
   * it's driven by the same off-chain scheduler on the same interval.
   * A no-op returning `Ok(false)` if no `risk_guard` is configured.
   */
  observe_risk: ({caller}: {caller: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a remove_keeper transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_keeper: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_risk_guard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Wires in an (already-deployed and initialized) `risk_guard`
   * instance, enabling the circuit-breaker check in `rebalance` and
   * the concentration check in `set_targets`. Optional and additive:
   * with none configured, both checks are simply skipped, exactly as
   * this vault behaved before `risk_guard` existed - see
   * `set_router`'s equivalent "not yet wired in" state, though unlike
   * the router, which `rebalance` fails closed *without*, an unset
   * `risk_guard` is not itself an error - it's an optional extra
   * safety layer, not a required capability.
   */
  set_risk_guard: ({risk_guard}: {risk_guard: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a needs_rebalance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * True if any asset's live drift meets or exceeds the configured
   * threshold. An empty vault (total value 0) never needs rebalancing.
   */
  needs_rebalance: (options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a remove_risk_guard transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  remove_risk_guard: (options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a compute_allocation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Current per-asset allocation vs. target, computed live from oracle
   * prices and on-chain balances. Read-only - no auth required.
   */
  compute_allocation: (options?: MethodOptions) => Promise<AssembledTransaction<Result<Array<AllocationEntry>>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAABAAAAAAAAAAAAAAABUVycm9yAAAAAAAADAAAAAAAAAAOTm90SW5pdGlhbGl6ZWQAAAAAAAEAAAAAAAAAEkFscmVhZHlJbml0aWFsaXplZAAAAAAAAgAAAAAAAAAOSW52YWxpZFRhcmdldHMAAAAAAAMAAAAAAAAAEEludmFsaWRUaHJlc2hvbGQAAAAEAAAAAAAAAA1JbnZhbGlkQW1vdW50AAAAAAAABQAAAAAAAAARQXNzZXROb3RJblRhcmdldHMAAAAAAAAGAAAAAAAAAAZQYXVzZWQAAAAAAAcAAAAAAAAADFVuYXV0aG9yaXplZAAAAAgAAAAAAAAADkJlbG93VGhyZXNob2xkAAAAAAAJAAAAAAAAABNSb3V0ZXJOb3RDb25maWd1cmVkAAAAAAoAAACeQSBjb25maWd1cmVkIGByaXNrX2d1YXJkYCByZXBvcnRzIHRoZSBicmVha2VyIGlzIGN1cnJlbnRseQp0cmlwcGVkIC0gc2VlIGBzZXRfcmlza19ndWFyZGAgYW5kIGBvYnNlcnZlX3Jpc2tgLiBOZXZlciByZXR1cm5lZAppZiBubyBgcmlza19ndWFyZGAgaXMgY29uZmlndXJlZC4AAAAAABVDaXJjdWl0QnJlYWtlclRyaXBwZWQAAAAAAAALAAAAr0EgY29uZmlndXJlZCBgcmlza19ndWFyZGAgcmVqZWN0ZWQgYHNldF90YXJnZXRzYCBiZWNhdXNlIGEgc2luZ2xlCmFzc2V0J3Mgd2VpZ2h0IGV4Y2VlZHMgaXRzIGNvbmZpZ3VyZWQgbWF4aW11bSBjb25jZW50cmF0aW9uLgpOZXZlciByZXR1cm5lZCBpZiBubyBgcmlza19ndWFyZGAgaXMgY29uZmlndXJlZC4AAAAAGkNvbmNlbnRyYXRpb25MaW1pdEV4Y2VlZGVkAAAAAAAM",
        "AAAAAQAAAAAAAAAAAAAADFRhcmdldFdlaWdodAAAAAMAAABBVGhlIHRva2VuIGNvbnRyYWN0IGFjdHVhbGx5IGN1c3RvZGllZCAoZGVwb3NpdC93aXRoZHJhdy9iYWxhbmNlKS4AAAAAAAAFYXNzZXQAAAAAAAATAAABIVRoZSBvcmFjbGUncyBrZXkgZm9yIHByaWNpbmcgdGhpcyBhc3NldCAtIG5vdCBuZWNlc3NhcmlseSB0aGUgc2FtZQppZGVudGlmaWVyIGFzIGBhc3NldGAuIFJlZmxlY3RvcidzIGxpdmUgZmVlZHMgcHJpY2UgbWFqb3IgYXNzZXRzIGJ5CnN5bWJvbCAoYEFzc2V0OjpPdGhlcigiWExNIilgLCBgIlVTREMiYCwgLi4uKSwgbm90IGJ5IHRoZQpTdGVsbGFyIGNvbnRyYWN0IGFkZHJlc3MgdGhhdCBhY3R1YWxseSBob2xkcyB0aGUgYmFsYW5jZSwgc28gdGhlCnR3byBtdXN0IGJlIHRyYWNrZWQgc2VwYXJhdGVseS4AAAAAAAALcHJpY2VfYXNzZXQAAAAH0AAAAAVBc3NldAAAAAAAAAAAAAAKd2VpZ2h0X2JwcwAAAAAABA==",
        "AAAAAQAAAAAAAAAAAAAAD0FsbG9jYXRpb25FbnRyeQAAAAAEAAAAAAAAAAVhc3NldAAAAAAAABMAAAAAAAAAEmN1cnJlbnRfd2VpZ2h0X2JwcwAAAAAABAAAAAAAAAAJZHJpZnRfYnBzAAAAAAAABQAAAAAAAAARdGFyZ2V0X3dlaWdodF9icHMAAAAAAAAE",
        "AAAAAQAAAAAAAAAAAAAAEFRyYWRlSW5zdHJ1Y3Rpb24AAAAEAAAAAAAAAAlhbW91bnRfaW4AAAAAAAALAAAAAAAAAAhhc3NldF9pbgAAABMAAAAAAAAACWFzc2V0X291dAAAAAAAABMAAAAAAAAADm1pbl9hbW91bnRfb3V0AAAAAAAL",
        "AAAAAAAAAG1EZXBvc2l0IGBhbW91bnRgIG9mIGBhc3NldGAgKG11c3QgYmUgb25lIG9mIHRoZSB2YXVsdCdzIGNvbmZpZ3VyZWQKdGFyZ2V0IGFzc2V0cykgZnJvbSBgZnJvbWAgaW50byB0aGUgdmF1bHQuAAAAAAAAB2RlcG9zaXQAAAAAAwAAAAAAAAAEZnJvbQAAABMAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAADFXaXRoZHJhdyBgYW1vdW50YCBvZiBgYXNzZXRgIHRvIGB0b2AuIE93bmVyLW9ubHkuAAAAAAAACHdpdGhkcmF3AAAAAwAAAAAAAAACdG8AAAAAABMAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAg1FeGVjdXRlIGEgc2V0IG9mIHRyYWRlcyB0byBicmluZyB0aGUgcG9ydGZvbGlvIGJhY2sgdG8gdGFyZ2V0LgpDYWxsYWJsZSBieSB0aGUgb3duZXIgb3IgdGhlIGNvbmZpZ3VyZWQga2VlcGVyLiBGYWlscyBjbG9zZWQ6Ci0gcmVmdXNlcyBpZiBwYXVzZWQKLSByZWZ1c2VzIGlmIGRyaWZ0IGlzIGJlbG93IHRocmVzaG9sZCAobm8tb3AsIG5vIGZlZXMgYnVybmVkKQotIHJlZnVzZXMgaWYgYSBjb25maWd1cmVkIGByaXNrX2d1YXJkYCdzIGNpcmN1aXQgYnJlYWtlciBpcwp0cmlwcGVkIChzZWUgYG9ic2VydmVfcmlza2ApIC0gc2tpcHBlZCBlbnRpcmVseSBpZiBub25lIGlzCmNvbmZpZ3VyZWQKLSByZWZ1c2VzIGFueSB0cmFkZSB0b3VjaGluZyBhbiBhc3NldCBvdXRzaWRlIHRoZSBjb25maWd1cmVkCnRhcmdldHMsIHNvIGZ1bmRzIGNhbiBuZXZlciBiZSByb3V0ZWQgYW55d2hlcmUgYnV0IGJldHdlZW4gdGhlCnZhdWx0J3Mgb3duIGRlY2xhcmVkIGFzc2V0cwotIHJlZnVzZXMgaWYgbm8gcm91dGVyIGlzIGNvbmZpZ3VyZWQAAAAAAAAJcmViYWxhbmNlAAAAAAAAAgAAAAAAAAAGY2FsbGVyAAAAAAATAAAAAAAAAAZ0cmFkZXMAAAAAA+oAAAfQAAAAEFRyYWRlSW5zdHJ1Y3Rpb24AAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAqpPbmUtdGltZSBzZXR1cC4gYHRhcmdldHNgIHdlaWdodHMgbXVzdCBzdW0gdG8gMTBfMDAwIGJwcyAoMTAwJSksCndpdGggbm8gZHVwbGljYXRlIGFzc2V0cy4gYHRocmVzaG9sZF9icHNgIGlzIHRoZSBwZXItYXNzZXQgZHJpZnQKKGluIGJwcyBvZiB0b3RhbCBwb3J0Zm9saW8gdmFsdWUpIHRoYXQgbXVzdCBiZSBleGNlZWRlZCBiZWZvcmUKYHJlYmFsYW5jZWAgd2lsbCBkbyBhbnl0aGluZy4KCk5vdGUgb24gcHJpY2UgbWF0aDogYGNvbXB1dGVfYWxsb2NhdGlvbmAgY29tcGFyZXMgYXNzZXRzIHB1cmVseSBieQp2YWx1ZSByYXRpbywgbmV2ZXIgaW4gYWJzb2x1dGUgdGVybXMsIHNvIGl0IGlzIGNvcnJlY3QgYXMgbG9uZyBhcwpldmVyeSB0YXJnZXQgYXNzZXQgc2hhcmVzIHRoZSBzYW1lIHRva2VuIGRlY2ltYWxzICh0cnVlIGZvciBhbGwKU3RlbGxhciBTQUMtd3JhcHBlZCBhc3NldHM6IDcgZGVjaW1hbHMpIGFuZCBpcyBwcmljZWQgYnkgdGhlIHNhbWUKb3JhY2xlIGZlZWQgZGVjaW1hbHMgKFJlZmxlY3RvciByZXBvcnRzIG9uZSBgZGVjaW1hbHMoKWAgZm9yIGl0cwp3aG9sZSBmZWVkKS4gTWl4aW5nIG9yYWNsZSBzb3VyY2VzIHdpdGggZGlmZmVyZW50IGRlY2ltYWxzIHBlcgphc3NldCB3b3VsZCBuZWVkIGV4cGxpY2l0IG5vcm1hbGl6YXRpb24gLSBvdXQgb2Ygc2NvcGUgZm9yIFBoYXNlIDAuAAAAAAAKaW5pdGlhbGl6ZQAAAAAABAAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAA5vcmFjbGVfYWRhcHRlcgAAAAAAEwAAAAAAAAAHdGFyZ2V0cwAAAAPqAAAH0AAAAAxUYXJnZXRXZWlnaHQAAAAAAAAADXRocmVzaG9sZF9icHMAAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAALhHcmFudCBhIGJhY2tlbmQga2VlcGVyIHBlcm1pc3Npb24gdG8gY2FsbCBgcmViYWxhbmNlYC4gVGhlIGtlZXBlcgpjYW4gbmV2ZXIgY2FsbCBgd2l0aGRyYXdgLCBgc2V0X3RhcmdldHNgLCBgc2V0X3JvdXRlcmAsIG9yCmBzZXRfa2VlcGVyYCAtIHRob3NlIGFsbCByZXF1aXJlIHRoZSBvd25lcidzIG93biBzaWduYXR1cmUuAAAACnNldF9rZWVwZXIAAAAAAAEAAAAAAAAABmtlZXBlcgAAAAAAEwAAAAEAAAPpAAAAAgAAAAM=",
        "AAAAAAAAAJZQYXVzaW5nIGJsb2NrcyBgZGVwb3NpdGAgYW5kIGByZWJhbGFuY2VgIG9ubHkuIGB3aXRoZHJhd2AgYWx3YXlzCndvcmtzLCByZWdhcmRsZXNzIG9mIHBhdXNlIHN0YXRlIC0gdXNlcnMgbXVzdCBuZXZlciBiZSBsb2NrZWQgb3V0Cm9mIHRoZWlyIG93biBmdW5kcy4AAAAAAApzZXRfcGF1c2VkAAAAAAABAAAAAAAAAAZwYXVzZWQAAAAAAAEAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAAKc2V0X3JvdXRlcgAAAAAAAQAAAAAAAAAGcm91dGVyAAAAAAATAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAAAAAAALc2V0X3RhcmdldHMAAAAAAgAAAAAAAAAHdGFyZ2V0cwAAAAPqAAAH0AAAAAxUYXJnZXRXZWlnaHQAAAAAAAAADXRocmVzaG9sZF9icHMAAAAAAAAEAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAXpGZWVkcyBjdXJyZW50IG9yYWNsZSBwcmljZXMgZm9yIGV2ZXJ5IHRhcmdldCBhc3NldCBpbnRvIHRoZQpjb25maWd1cmVkIGByaXNrX2d1YXJkYCwgc28gaXRzIGNpcmN1aXQgYnJlYWtlciBzdGF5cyBjdXJyZW50IGV2ZW4Kd2hlbiBub3RoaW5nIGlzIGN1cnJlbnRseSB0cnlpbmcgdG8gcmViYWxhbmNlLiBTYW1lIGNhbGxlcgpwZXJtaXNzaW9uIGFzIGByZWJhbGFuY2VgIChvd25lciBvciBrZWVwZXIpLCBzaW5jZSBpbiBwcmFjdGljZQppdCdzIGRyaXZlbiBieSB0aGUgc2FtZSBvZmYtY2hhaW4gc2NoZWR1bGVyIG9uIHRoZSBzYW1lIGludGVydmFsLgpBIG5vLW9wIHJldHVybmluZyBgT2soZmFsc2UpYCBpZiBubyBgcmlza19ndWFyZGAgaXMgY29uZmlndXJlZC4AAAAAAAxvYnNlcnZlX3Jpc2sAAAABAAAAAAAAAAZjYWxsZXIAAAAAABMAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAAAAAAANcmVtb3ZlX2tlZXBlcgAAAAAAAAAAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAhlXaXJlcyBpbiBhbiAoYWxyZWFkeS1kZXBsb3llZCBhbmQgaW5pdGlhbGl6ZWQpIGByaXNrX2d1YXJkYAppbnN0YW5jZSwgZW5hYmxpbmcgdGhlIGNpcmN1aXQtYnJlYWtlciBjaGVjayBpbiBgcmViYWxhbmNlYCBhbmQKdGhlIGNvbmNlbnRyYXRpb24gY2hlY2sgaW4gYHNldF90YXJnZXRzYC4gT3B0aW9uYWwgYW5kIGFkZGl0aXZlOgp3aXRoIG5vbmUgY29uZmlndXJlZCwgYm90aCBjaGVja3MgYXJlIHNpbXBseSBza2lwcGVkLCBleGFjdGx5IGFzCnRoaXMgdmF1bHQgYmVoYXZlZCBiZWZvcmUgYHJpc2tfZ3VhcmRgIGV4aXN0ZWQgLSBzZWUKYHNldF9yb3V0ZXJgJ3MgZXF1aXZhbGVudCAibm90IHlldCB3aXJlZCBpbiIgc3RhdGUsIHRob3VnaCB1bmxpa2UKdGhlIHJvdXRlciwgd2hpY2ggYHJlYmFsYW5jZWAgZmFpbHMgY2xvc2VkICp3aXRob3V0KiwgYW4gdW5zZXQKYHJpc2tfZ3VhcmRgIGlzIG5vdCBpdHNlbGYgYW4gZXJyb3IgLSBpdCdzIGFuIG9wdGlvbmFsIGV4dHJhCnNhZmV0eSBsYXllciwgbm90IGEgcmVxdWlyZWQgY2FwYWJpbGl0eS4AAAAAAAAOc2V0X3Jpc2tfZ3VhcmQAAAAAAAEAAAAAAAAACnJpc2tfZ3VhcmQAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAIFUcnVlIGlmIGFueSBhc3NldCdzIGxpdmUgZHJpZnQgbWVldHMgb3IgZXhjZWVkcyB0aGUgY29uZmlndXJlZAp0aHJlc2hvbGQuIEFuIGVtcHR5IHZhdWx0ICh0b3RhbCB2YWx1ZSAwKSBuZXZlciBuZWVkcyByZWJhbGFuY2luZy4AAAAAAAAPbmVlZHNfcmViYWxhbmNlAAAAAAAAAAABAAAD6QAAAAEAAAAD",
        "AAAAAAAAAAAAAAARcmVtb3ZlX3Jpc2tfZ3VhcmQAAAAAAAAAAAAAAQAAA+kAAAACAAAAAw==",
        "AAAAAAAAAH5DdXJyZW50IHBlci1hc3NldCBhbGxvY2F0aW9uIHZzLiB0YXJnZXQsIGNvbXB1dGVkIGxpdmUgZnJvbSBvcmFjbGUKcHJpY2VzIGFuZCBvbi1jaGFpbiBiYWxhbmNlcy4gUmVhZC1vbmx5IC0gbm8gYXV0aCByZXF1aXJlZC4AAAAAABJjb21wdXRlX2FsbG9jYXRpb24AAAAAAAAAAAABAAAD6QAAA+oAAAfQAAAAD0FsbG9jYXRpb25FbnRyeQAAAAAD",
        "AAAAAgAAADtNYXRjaGVzIHRoZSBSZWZsZWN0b3IgLyBTRVAtNDAgb3JhY2xlIGFzc2V0IHJlcHJlc2VudGF0aW9uLgAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR",
        "AAAAAQAAADVNYXRjaGVzIHRoZSBSZWZsZWN0b3IgLyBTRVAtNDAgb3JhY2xlIHByaWNlIHJlc3BvbnNlLgAAAAAAAAAAAAAJUHJpY2VEYXRhAAAAAAAAAgAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAABAAAAAAAAAAAAAAAC09yYWNsZUVycm9yAAAAAAUAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAABAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAIAAAAAAAAAEFByaWNlVW5hdmFpbGFibGUAAAADAAAAAAAAAApQcmljZVN0YWxlAAAAAAAEAAAAAAAAAAxJbnZhbGlkUHJpY2UAAAAF",
        "AAAABAAAAAAAAAAAAAAACVJpc2tFcnJvcgAAAAAAAAYAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAABAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAIAAAAAAAAADFVuYXV0aG9yaXplZAAAAAMAAAAAAAAADUludmFsaWRDb25maWcAAAAAAAAEAAAAAAAAABVDaXJjdWl0QnJlYWtlclRyaXBwZWQAAAAAAAAFAAAAAAAAABpDb25jZW50cmF0aW9uTGltaXRFeGNlZWRlZAAAAAAABg==",
        "AAAAAQAAAT9PbmUgYXNzZXQncyBjdXJyZW50bHktb2JzZXJ2ZWQgcHJpY2UsIGFzIHRoZSB2YXVsdCBzZWVzIGl0IChzYW1lCnZhbHVlIGl0IGp1c3QgZ290IGZyb20gaXRzIG93biBvcmFjbGVfYWRhcHRlcikuIGByaXNrX2d1YXJkYCBuZXZlcgp0YWxrcyB0byBhbiBvcmFjbGUgZGlyZWN0bHkgLSBpdCBvbmx5IGV2ZXIgc2VlcyB3aGF0IHRoZSB2YXVsdCBoYW5kcwppdCwgc28gdGhlcmUncyBubyB0aGlyZCBjcm9zcy1jb250cmFjdCBob3AgYW5kIG5vIHJpc2sgb2YgdGhlIHR3bwpkaXNhZ3JlZWluZyBhYm91dCB3aGljaCBwcmljZSBmZWVkIGlzIGF1dGhvcml0YXRpdmUuAAAAAAAAAAAQUHJpY2VPYnNlcnZhdGlvbgAAAAIAAADXVGhlIGN1c3RvZGllZCB0b2tlbiBhZGRyZXNzIChtYXRjaGVzIGBUYXJnZXRXZWlnaHQuYXNzZXRgIGluCmB2YXVsdGApLCBub3QgdGhlIG9yYWNsZSdzIHByaWNpbmcga2V5IC0gdGhpcyBpcyBqdXN0IGFuIG9wYXF1ZQppZGVudGlmaWVyIHRvIGByaXNrX2d1YXJkYCwgdXNlZCBvbmx5IHRvIGtleSBpdHMgb3duCmxhc3Qtb2JzZXJ2ZWQtcHJpY2UgbWVtb3J5IHBlciBhc3NldC4AAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAFcHJpY2UAAAAAAAAL" ]),
      options
    )
  }
  public readonly fromJSON = {
    deposit: this.txFromJSON<Result<void>>,
        withdraw: this.txFromJSON<Result<void>>,
        rebalance: this.txFromJSON<Result<void>>,
        initialize: this.txFromJSON<Result<void>>,
        set_keeper: this.txFromJSON<Result<void>>,
        set_paused: this.txFromJSON<Result<void>>,
        set_router: this.txFromJSON<Result<void>>,
        set_targets: this.txFromJSON<Result<void>>,
        observe_risk: this.txFromJSON<Result<boolean>>,
        remove_keeper: this.txFromJSON<Result<void>>,
        set_risk_guard: this.txFromJSON<Result<void>>,
        needs_rebalance: this.txFromJSON<Result<boolean>>,
        remove_risk_guard: this.txFromJSON<Result<void>>,
        compute_allocation: this.txFromJSON<Result<Array<AllocationEntry>>>
  }
}