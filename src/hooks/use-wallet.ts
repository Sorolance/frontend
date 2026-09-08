"use client";

import { useCallback, useEffect, useState } from "react";
import {
  connectWallet,
  disconnectWallet,
  onWalletStateChanged,
} from "@/lib/stellar/wallet";

export function useWallet() {
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    return onWalletStateChanged((state) => setAddress(state.address));
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      await connectWallet();
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await disconnectWallet();
  }, []);

  return { address, connecting, connect, disconnect };
}
