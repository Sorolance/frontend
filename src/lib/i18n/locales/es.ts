import type { Dictionary } from "./en";

export const es: Dictionary = {
  common: {
    connectWallet: "Conectar billetera",
    connecting: "Conectando…",
    disconnectWallet: "Desconectar billetera",
    deposit: "Depositar",
    withdraw: "Retirar",
    allocation: "Asignación",
    targetAllocation: "Asignación objetivo",
    drift: "Desviación",
    setTargets: "Establecer objetivos",
    transactionFailed: "La transacción falló.",
    unknownError: "error desconocido",
    totalMustEqual100: (pct) => `Total: ${pct}% (debe ser igual a 100.00%)`,
    amountIn: (asset) => `Monto en ${asset}`,
    thresholdPlaceholder: "p. ej. 5",
    language: "Idioma",
  },
  status: {
    onTarget: "En el objetivo",
    needsRebalance: "La desviación supera el umbral - se necesita reequilibrar",
  },
  nav: {
    backToRebalancer: "← Rebalancer",
    backToDashboard: "← Panel",
    backToPortfolios: "← Carteras",
    subPortfolios: "Subcarteras →",
    openDashboard: "Abrir panel",
    openLiveDashboard: "Abrir panel en vivo",
    tryDemo: "Probar demo",
  },
  home: {
    kicker: "Stellar · Soroban",
    title: "Reequilibrio automático de carteras, en cadena",
    description:
      "Define una asignación objetivo y un umbral de desviación. Tu vault de Soroban custodia los fondos - nunca un custodio, nunca esta app - y reequilibra solo cuando se desvía más allá del umbral que definiste.",
    testnetNotice:
      "Actualmente en vivo en Stellar testnet. Sin auditar - no usar con fondos de mainnet.",
  },
  dashboard: {
    title: "Cartera",
    liveFrom: "En vivo desde el vault desplegado en Stellar testnet.",
  },
  allocationChart: {
    loadError: (message) =>
      `No se pudo leer la asignación en vivo desde el contrato del vault: ${message}`,
  },
  allocationBars: {
    vsTarget: (current, target) => `${current} frente a ${target} objetivo`,
    underweight: "por debajo del objetivo (infraponderado)",
    overweight: "por encima del objetivo (sobreponderado)",
  },
  depositWithdrawForm: {
    connectToDepositWithdraw: "Conecta una billetera para depositar o retirar.",
    deposited: (amount, asset) => `Depositaste ${amount} ${asset}.`,
    withdrew: (amount, asset) => `Retiraste ${amount} ${asset}.`,
  },
  setTargetsForm: {
    driftHelp:
      "El reequilibrio se activa en cuanto algún activo se desvía tanto de su objetivo.",
    connectToChangeTargets: "Conecta una billetera para cambiar los objetivos.",
    targetsUpdated: "Objetivos actualizados.",
  },
  demo: {
    banner: (amount) =>
      `Modo demo - una cartera simulada de ${amount}. Sin billetera, sin fondos reales, nada aquí toca el vault desplegado. Los depósitos/retiros y movimientos de precio son solo locales a esta página.`,
    total: (amount) => `${amount} en total`,
    depositWithdrawSimulate: "Depositar / retirar / simular",
    currentThreshold: (pct) => `Umbral actual: ${pct}`,
  },
  demoActions: {
    shockHelp:
      "Simula un movimiento de precio para generar desviación y observa cómo cambia el estado de arriba.",
    rebalanceNow: "Reequilibrar ahora",
    resetDemo: "Reiniciar demo",
  },
  createPortfolioForm: {
    name: "Nombre",
    namePlaceholder: "p. ej. Jubilación",
    create: "Crear cartera",
    creating: "Creando…",
    deploying:
      "Desplegando el vault, inicializando y autorizando al keeper — aprueba cada paso en tu billetera…",
    created: "Cartera creada.",
    createFailed: "No se pudo crear la cartera.",
    connectToCreate: "Conecta una billetera para crear una cartera.",
  },
  portfolios: {
    title: "Carteras",
    subtitle: "Cada cartera es su propio vault, desplegado y controlado por tu billetera.",
    connectToSee: "Conecta una billetera para ver tus carteras.",
    loadError: (message) => `No se pudieron cargar las carteras: ${message}`,
    empty: "Aún no hay carteras — crea una abajo.",
    driftThreshold: (pct) => `umbral de desviación de ${pct}`,
    createSection: "Crear una cartera",
  },
  portfolioDetail: {
    vaultAddress: (short) => `Vault ${short}`,
    loadError: (message) => `No se pudo cargar esta cartera: ${message}`,
    downloadAuditLog: "Descargar registro de auditoría (CSV)",
  },
};
