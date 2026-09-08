import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { Client as VaultClient, networks as vaultNetworks } from "@/contracts/vault";
import {
  Client as OracleAdapterClient,
  networks as oracleNetworks,
} from "@/contracts/oracle-adapter";
import { RPC_URL } from "./config";

/**
 * `StellarWalletsKit.signTransaction` already matches the `SignTransaction`
 * shape the generated clients expect (same `(xdr, opts) => {signedTxXdr}`
 * signature Freighter uses), so it can be passed straight through - no
 * adapter needed.
 */
export function getVaultClient(wallet?: { publicKey?: string }) {
  return new VaultClient({
    ...vaultNetworks.testnet,
    rpcUrl: RPC_URL,
    publicKey: wallet?.publicKey,
    signTransaction: StellarWalletsKit.signTransaction,
  });
}

export function getOracleAdapterClient(wallet?: { publicKey?: string }) {
  return new OracleAdapterClient({
    ...oracleNetworks.testnet,
    rpcUrl: RPC_URL,
    publicKey: wallet?.publicKey,
    signTransaction: StellarWalletsKit.signTransaction,
  });
}
