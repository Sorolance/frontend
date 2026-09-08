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
    contractId: "CA3RFMJ4BQ3G7OH5MJKZE56VCHY7NFQASAJN2CYNEZBM4NL76SNBBY5E",
  }
} as const

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

export interface Client {
  /**
   * Construct and simulate a decimals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  decimals: (options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a get_price transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Returns a validated price for `asset`, in the underlying oracle's
   * native decimals. Never returns a stale or non-positive price -
   * callers must treat `Err` as "no trustworthy price right now", not
   * fall back to a cached or default value.
   */
  get_price: ({asset}: {asset: Asset}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * One-time setup. `reflector` is the address of the deployed Reflector
   * oracle contract on this network. `max_staleness_secs` is how old a
   * price is allowed to be before `get_price` rejects it.
   */
  initialize: ({admin, reflector, max_staleness_secs}: {admin: string, reflector: string, max_staleness_secs: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_reflector transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_reflector: ({reflector}: {reflector: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a set_max_staleness transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  set_max_staleness: ({max_staleness_secs}: {max_staleness_secs: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

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
      new ContractSpec([ "AAAAAAAAAAAAAAAIZGVjaW1hbHMAAAAAAAAAAQAAA+kAAAAEAAAAAw==",
        "AAAAAAAAAOpSZXR1cm5zIGEgdmFsaWRhdGVkIHByaWNlIGZvciBgYXNzZXRgLCBpbiB0aGUgdW5kZXJseWluZyBvcmFjbGUncwpuYXRpdmUgZGVjaW1hbHMuIE5ldmVyIHJldHVybnMgYSBzdGFsZSBvciBub24tcG9zaXRpdmUgcHJpY2UgLQpjYWxsZXJzIG11c3QgdHJlYXQgYEVycmAgYXMgIm5vIHRydXN0d29ydGh5IHByaWNlIHJpZ2h0IG5vdyIsIG5vdApmYWxsIGJhY2sgdG8gYSBjYWNoZWQgb3IgZGVmYXVsdCB2YWx1ZS4AAAAAAAlnZXRfcHJpY2UAAAAAAAABAAAAAAAAAAVhc3NldAAAAAAAB9AAAAAFQXNzZXQAAAAAAAABAAAD6QAAAAsAAAAD",
        "AAAAAAAAAL1PbmUtdGltZSBzZXR1cC4gYHJlZmxlY3RvcmAgaXMgdGhlIGFkZHJlc3Mgb2YgdGhlIGRlcGxveWVkIFJlZmxlY3RvcgpvcmFjbGUgY29udHJhY3Qgb24gdGhpcyBuZXR3b3JrLiBgbWF4X3N0YWxlbmVzc19zZWNzYCBpcyBob3cgb2xkIGEKcHJpY2UgaXMgYWxsb3dlZCB0byBiZSBiZWZvcmUgYGdldF9wcmljZWAgcmVqZWN0cyBpdC4AAAAAAAAKaW5pdGlhbGl6ZQAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAlyZWZsZWN0b3IAAAAAAAATAAAAAAAAABJtYXhfc3RhbGVuZXNzX3NlY3MAAAAAAAYAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAANc2V0X3JlZmxlY3RvcgAAAAAAAAEAAAAAAAAACXJlZmxlY3RvcgAAAAAAABMAAAABAAAD6QAAAAIAAAAD",
        "AAAAAAAAAAAAAAARc2V0X21heF9zdGFsZW5lc3MAAAAAAAABAAAAAAAAABJtYXhfc3RhbGVuZXNzX3NlY3MAAAAAAAYAAAABAAAD6QAAAAIAAAAD",
        "AAAAAgAAADtNYXRjaGVzIHRoZSBSZWZsZWN0b3IgLyBTRVAtNDAgb3JhY2xlIGFzc2V0IHJlcHJlc2VudGF0aW9uLgAAAAAAAAAABUFzc2V0AAAAAAAAAgAAAAEAAAAAAAAAB1N0ZWxsYXIAAAAAAQAAABMAAAABAAAAAAAAAAVPdGhlcgAAAAAAAAEAAAAR",
        "AAAAAQAAADVNYXRjaGVzIHRoZSBSZWZsZWN0b3IgLyBTRVAtNDAgb3JhY2xlIHByaWNlIHJlc3BvbnNlLgAAAAAAAAAAAAAJUHJpY2VEYXRhAAAAAAAAAgAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAl0aW1lc3RhbXAAAAAAAAAG",
        "AAAABAAAAAAAAAAAAAAAC09yYWNsZUVycm9yAAAAAAUAAAAAAAAADk5vdEluaXRpYWxpemVkAAAAAAABAAAAAAAAABJBbHJlYWR5SW5pdGlhbGl6ZWQAAAAAAAIAAAAAAAAAEFByaWNlVW5hdmFpbGFibGUAAAADAAAAAAAAAApQcmljZVN0YWxlAAAAAAAEAAAAAAAAAAxJbnZhbGlkUHJpY2UAAAAF" ]),
      options
    )
  }
  public readonly fromJSON = {
    decimals: this.txFromJSON<Result<u32>>,
        get_price: this.txFromJSON<Result<i128>>,
        initialize: this.txFromJSON<Result<void>>,
        set_reflector: this.txFromJSON<Result<void>>,
        set_max_staleness: this.txFromJSON<Result<void>>
  }
}