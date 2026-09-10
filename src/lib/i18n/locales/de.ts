import type { Dictionary } from "./en";

export const de: Dictionary = {
  common: {
    connectWallet: "Wallet verbinden",
    connecting: "Verbinde…",
    disconnectWallet: "Wallet trennen",
    deposit: "Einzahlen",
    withdraw: "Abheben",
    allocation: "Allokation",
    targetAllocation: "Zielallokation",
    drift: "Abweichung",
    setTargets: "Ziele festlegen",
    transactionFailed: "Transaktion fehlgeschlagen.",
    unknownError: "unbekannter Fehler",
    totalMustEqual100: (pct) => `Summe: ${pct}% (muss 100,00% ergeben)`,
    amountIn: (asset) => `Betrag in ${asset}`,
    thresholdPlaceholder: "z. B. 5",
    language: "Sprache",
  },
  status: {
    onTarget: "Im Ziel",
    needsRebalance: "Abweichung über dem Schwellenwert - Rebalancing nötig",
  },
  nav: {
    backToRebalancer: "← Rebalancer",
    backToDashboard: "← Dashboard",
    backToPortfolios: "← Portfolios",
    subPortfolios: "Unterportfolios →",
    openDashboard: "Dashboard öffnen",
    openLiveDashboard: "Live-Dashboard öffnen",
    tryDemo: "Demo ausprobieren",
  },
  home: {
    kicker: "Stellar · Soroban",
    title: "Automatisches Portfolio-Rebalancing, on-chain",
    description:
      "Lege eine Zielallokation und einen Abweichungs-Schwellenwert fest. Dein Soroban-Vault verwahrt die Mittel - nie ein Verwahrer, nie diese App - und gleicht nur aus, wenn die Abweichung den festgelegten Schwellenwert überschreitet.",
    testnetNotice:
      "Derzeit live im Stellar-Testnet. Nicht geprüft - nicht mit Mainnet-Geldern verwenden.",
  },
  dashboard: {
    title: "Portfolio",
    liveFrom: "Live vom im Stellar-Testnet bereitgestellten Vault.",
  },
  allocationChart: {
    loadError: (message) =>
      `Live-Allokation konnte nicht vom Vault-Contract gelesen werden: ${message}`,
  },
  allocationBars: {
    vsTarget: (current, target) => `${current} von ${target} Ziel`,
    underweight: "untergewichtet (unter Ziel)",
    overweight: "übergewichtet (über Ziel)",
  },
  depositWithdrawForm: {
    connectToDepositWithdraw: "Verbinde ein Wallet, um einzuzahlen oder abzuheben.",
    deposited: (amount, asset) => `${amount} ${asset} eingezahlt.`,
    withdrew: (amount, asset) => `${amount} ${asset} abgehoben.`,
  },
  setTargetsForm: {
    driftHelp:
      "Das Rebalancing löst aus, sobald ein Asset so weit von seinem Ziel abweicht.",
    connectToChangeTargets: "Verbinde ein Wallet, um die Ziele zu ändern.",
    targetsUpdated: "Ziele aktualisiert.",
  },
  demo: {
    banner: (amount) =>
      `Demo-Modus - ein simuliertes Portfolio über ${amount}. Kein Wallet, keine echten Mittel, nichts hier berührt den bereitgestellten Vault. Einzahlungen/Abhebungen und Preisbewegungen sind rein lokal auf dieser Seite.`,
    total: (amount) => `${amount} gesamt`,
    depositWithdrawSimulate: "Einzahlen / abheben / simulieren",
    currentThreshold: (pct) => `Aktueller Schwellenwert: ${pct}`,
  },
  demoActions: {
    shockHelp:
      "Simuliere eine Preisbewegung, um eine Abweichung zu erzeugen, und beobachte, wie sich der Status oben ändert.",
    rebalanceNow: "Jetzt ausgleichen",
    resetDemo: "Demo zurücksetzen",
  },
  createPortfolioForm: {
    name: "Name",
    namePlaceholder: "z. B. Altersvorsorge",
    create: "Portfolio erstellen",
    creating: "Wird erstellt…",
    deploying:
      "Vault wird bereitgestellt, initialisiert und der Keeper autorisiert — bestätige jeden Schritt in deinem Wallet…",
    created: "Portfolio erstellt.",
    createFailed: "Portfolio konnte nicht erstellt werden.",
    connectToCreate: "Verbinde ein Wallet, um ein Portfolio zu erstellen.",
  },
  portfolios: {
    title: "Portfolios",
    subtitle: "Jedes Portfolio ist ein eigener Vault, bereitgestellt und kontrolliert von deinem Wallet.",
    connectToSee: "Verbinde ein Wallet, um deine Portfolios zu sehen.",
    loadError: (message) => `Portfolios konnten nicht geladen werden: ${message}`,
    empty: "Noch keine Portfolios — erstelle unten eines.",
    driftThreshold: (pct) => `Abweichungs-Schwellenwert von ${pct}`,
    createSection: "Ein Portfolio erstellen",
  },
  portfolioDetail: {
    vaultAddress: (short) => `Vault ${short}`,
    loadError: (message) => `Dieses Portfolio konnte nicht geladen werden: ${message}`,
    downloadAuditLog: "Audit-Log herunterladen (CSV)",
  },
};
