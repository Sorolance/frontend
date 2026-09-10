/** Source-of-truth dictionary - every other locale's shape is checked
 * against `Dictionary` (this file's inferred type), so a missing or
 * mistyped key in another locale fails at compile time rather than
 * silently falling back to English at runtime. Interpolated strings are
 * functions rather than `{token}` templates for the same reason: a
 * caller passing the wrong argument type/count is a type error, not a
 * blank spot in the rendered page. */
export const en = {
  common: {
    connectWallet: "Connect Wallet",
    connecting: "Connecting…",
    disconnectWallet: "Disconnect wallet",
    deposit: "Deposit",
    withdraw: "Withdraw",
    allocation: "Allocation",
    targetAllocation: "Target allocation",
    drift: "Drift",
    setTargets: "Set targets",
    transactionFailed: "Transaction failed.",
    unknownError: "unknown error",
    totalMustEqual100: (pct: string) => `Total: ${pct}% (must equal 100.00%)`,
    amountIn: (asset: string) => `Amount in ${asset}`,
    thresholdPlaceholder: "e.g. 5",
    language: "Language",
  },
  status: {
    onTarget: "On target",
    needsRebalance: "Drift exceeds threshold - rebalance needed",
  },
  nav: {
    backToRebalancer: "← Rebalancer",
    backToDashboard: "← Dashboard",
    backToPortfolios: "← Portfolios",
    subPortfolios: "Sub-portfolios →",
    openDashboard: "Open dashboard",
    openLiveDashboard: "Open live dashboard",
    tryDemo: "Try demo",
  },
  home: {
    kicker: "Stellar · Soroban",
    title: "Automated portfolio rebalancing, on-chain",
    description:
      "Set a target allocation and a drift threshold. Your Soroban vault holds the funds - never a custodian, never this app - and rebalances only when it drifts past the threshold you set.",
    testnetNotice:
      "Currently live on Stellar testnet. Not audited - do not use with mainnet funds.",
  },
  dashboard: {
    title: "Portfolio",
    liveFrom: "Live from the vault deployed on Stellar testnet.",
  },
  allocationChart: {
    loadError: (message: string) =>
      `Couldn't read live allocation from the vault contract: ${message}`,
  },
  allocationBars: {
    vsTarget: (current: string, target: string) => `${current} vs ${target} target`,
    underweight: "underweight (below target)",
    overweight: "overweight (above target)",
  },
  depositWithdrawForm: {
    connectToDepositWithdraw: "Connect a wallet to deposit or withdraw.",
    deposited: (amount: string, asset: string) => `Deposited ${amount} ${asset}.`,
    withdrew: (amount: string, asset: string) => `Withdrew ${amount} ${asset}.`,
  },
  setTargetsForm: {
    driftHelp: "Rebalancing triggers once any asset drifts this far from its target.",
    connectToChangeTargets: "Connect a wallet to change targets.",
    targetsUpdated: "Targets updated.",
  },
  demo: {
    banner: (amount: string) =>
      `Demo mode - a simulated ${amount} portfolio. No wallet, no real funds, nothing here touches the deployed vault. Deposit/withdraw and price moves are all local to this page.`,
    total: (amount: string) => `${amount} total`,
    depositWithdrawSimulate: "Deposit / withdraw / simulate",
    currentThreshold: (pct: string) => `Current threshold: ${pct}`,
  },
  demoActions: {
    shockHelp: "Simulate a price move to create drift, then watch the status above change.",
    rebalanceNow: "Rebalance now",
    resetDemo: "Reset demo",
  },
  createPortfolioForm: {
    name: "Name",
    namePlaceholder: "e.g. Retirement",
    create: "Create portfolio",
    creating: "Creating…",
    deploying:
      "Deploying vault, initializing, and authorizing the keeper — approve each in your wallet…",
    created: "Portfolio created.",
    createFailed: "Failed to create portfolio.",
    connectToCreate: "Connect a wallet to create a portfolio.",
  },
  portfolios: {
    title: "Portfolios",
    subtitle: "Each portfolio is its own vault, deployed and owned by your wallet.",
    connectToSee: "Connect a wallet to see your portfolios.",
    loadError: (message: string) => `Couldn't load portfolios: ${message}`,
    empty: "No portfolios yet — create one below.",
    driftThreshold: (pct: string) => `${pct} drift threshold`,
    createSection: "Create a portfolio",
  },
  portfolioDetail: {
    vaultAddress: (short: string) => `Vault ${short}`,
    loadError: (message: string) => `Couldn't load this portfolio: ${message}`,
    downloadAuditLog: "Download audit log (CSV)",
  },
};

export type Dictionary = typeof en;
