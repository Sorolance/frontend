import {
  StellarWalletsKit,
  KitEventType,
  Networks,
  type KitEventStateUpdated,
} from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

let initialized = false;

/** Idempotent - safe to call from every entry point that needs the kit. */
function ensureInitialized() {
  if (initialized) return;
  StellarWalletsKit.init({
    modules: defaultModules(),
    network: Networks.TESTNET,
  });
  initialized = true;
}

export type WalletState = {
  address: string | undefined;
};

/** Fires immediately with the current state, then on every change. */
export function onWalletStateChanged(
  callback: (state: WalletState) => void,
): () => void {
  ensureInitialized();
  return StellarWalletsKit.on(
    KitEventType.STATE_UPDATED,
    (event: KitEventStateUpdated) => {
      callback({ address: event.payload.address });
    },
  );
}

export async function connectWallet(): Promise<WalletState> {
  ensureInitialized();
  const { address } = await StellarWalletsKit.authModal();
  return { address };
}

export async function disconnectWallet(): Promise<void> {
  ensureInitialized();
  await StellarWalletsKit.disconnect();
}
