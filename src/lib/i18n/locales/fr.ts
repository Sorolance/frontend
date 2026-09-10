import type { Dictionary } from "./en";

export const fr: Dictionary = {
  common: {
    connectWallet: "Connecter le portefeuille",
    connecting: "Connexion…",
    disconnectWallet: "Déconnecter le portefeuille",
    deposit: "Déposer",
    withdraw: "Retirer",
    allocation: "Répartition",
    targetAllocation: "Répartition cible",
    drift: "Écart",
    setTargets: "Définir les objectifs",
    transactionFailed: "La transaction a échoué.",
    unknownError: "erreur inconnue",
    totalMustEqual100: (pct) => `Total : ${pct} % (doit être égal à 100,00 %)`,
    amountIn: (asset) => `Montant en ${asset}`,
    thresholdPlaceholder: "ex. 5",
    language: "Langue",
  },
  status: {
    onTarget: "Conforme à l'objectif",
    needsRebalance: "L'écart dépasse le seuil - rééquilibrage nécessaire",
  },
  nav: {
    backToRebalancer: "← Rebalancer",
    backToDashboard: "← Tableau de bord",
    backToPortfolios: "← Portefeuilles",
    subPortfolios: "Sous-portefeuilles →",
    openDashboard: "Ouvrir le tableau de bord",
    openLiveDashboard: "Ouvrir le tableau de bord en direct",
    tryDemo: "Essayer la démo",
  },
  home: {
    kicker: "Stellar · Soroban",
    title: "Rééquilibrage automatique de portefeuille, on-chain",
    description:
      "Définissez une répartition cible et un seuil d'écart. Votre vault Soroban détient les fonds - jamais un dépositaire, jamais cette application - et ne rééquilibre que lorsque l'écart dépasse le seuil défini.",
    testnetNotice:
      "Actuellement en ligne sur le testnet Stellar. Non audité - à ne pas utiliser avec des fonds du mainnet.",
  },
  dashboard: {
    title: "Portefeuille",
    liveFrom: "En direct depuis le vault déployé sur le testnet Stellar.",
  },
  allocationChart: {
    loadError: (message) =>
      `Impossible de lire la répartition en direct depuis le contrat du vault : ${message}`,
  },
  allocationBars: {
    vsTarget: (current, target) => `${current} contre ${target} cible`,
    underweight: "sous-pondéré (en dessous de la cible)",
    overweight: "surpondéré (au-dessus de la cible)",
  },
  depositWithdrawForm: {
    connectToDepositWithdraw: "Connectez un portefeuille pour déposer ou retirer.",
    deposited: (amount, asset) => `${amount} ${asset} déposé(s).`,
    withdrew: (amount, asset) => `${amount} ${asset} retiré(s).`,
  },
  setTargetsForm: {
    driftHelp:
      "Le rééquilibrage se déclenche dès qu'un actif s'écarte autant de sa cible.",
    connectToChangeTargets: "Connectez un portefeuille pour modifier les objectifs.",
    targetsUpdated: "Objectifs mis à jour.",
  },
  demo: {
    banner: (amount) =>
      `Mode démo - un portefeuille simulé de ${amount}. Aucun portefeuille, aucun fonds réel, rien ici ne touche le vault déployé. Les dépôts/retraits et les variations de prix sont uniquement locaux à cette page.`,
    total: (amount) => `${amount} au total`,
    depositWithdrawSimulate: "Déposer / retirer / simuler",
    currentThreshold: (pct) => `Seuil actuel : ${pct}`,
  },
  demoActions: {
    shockHelp:
      "Simulez une variation de prix pour créer un écart, puis observez le statut ci-dessus changer.",
    rebalanceNow: "Rééquilibrer maintenant",
    resetDemo: "Réinitialiser la démo",
  },
  createPortfolioForm: {
    name: "Nom",
    namePlaceholder: "ex. Retraite",
    create: "Créer le portefeuille",
    creating: "Création…",
    deploying:
      "Déploiement du vault, initialisation et autorisation du keeper — approuvez chaque étape dans votre portefeuille…",
    created: "Portefeuille créé.",
    createFailed: "Échec de la création du portefeuille.",
    connectToCreate: "Connectez un portefeuille pour créer un portefeuille.",
  },
  portfolios: {
    title: "Portefeuilles",
    subtitle:
      "Chaque portefeuille est son propre vault, déployé et détenu par votre portefeuille.",
    connectToSee: "Connectez un portefeuille pour voir vos portefeuilles.",
    loadError: (message) => `Impossible de charger les portefeuilles : ${message}`,
    empty: "Aucun portefeuille pour l'instant — créez-en un ci-dessous.",
    driftThreshold: (pct) => `seuil d'écart de ${pct}`,
    createSection: "Créer un portefeuille",
  },
  portfolioDetail: {
    vaultAddress: (short) => `Vault ${short}`,
    loadError: (message) => `Impossible de charger ce portefeuille : ${message}`,
    downloadAuditLog: "Télécharger le journal d'audit (CSV)",
  },
};
