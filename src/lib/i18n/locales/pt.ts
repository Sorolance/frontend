import type { Dictionary } from "./en";

export const pt: Dictionary = {
  common: {
    connectWallet: "Conectar carteira",
    connecting: "Conectando…",
    disconnectWallet: "Desconectar carteira",
    deposit: "Depositar",
    withdraw: "Sacar",
    allocation: "Alocação",
    targetAllocation: "Alocação-alvo",
    drift: "Desvio",
    setTargets: "Definir metas",
    transactionFailed: "A transação falhou.",
    unknownError: "erro desconhecido",
    totalMustEqual100: (pct) => `Total: ${pct}% (deve ser igual a 100,00%)`,
    amountIn: (asset) => `Valor em ${asset}`,
    thresholdPlaceholder: "ex.: 5",
    language: "Idioma",
  },
  status: {
    onTarget: "Dentro da meta",
    needsRebalance: "Desvio acima do limite - rebalanceamento necessário",
  },
  nav: {
    backToRebalancer: "← Rebalancer",
    backToDashboard: "← Painel",
    backToPortfolios: "← Carteiras",
    subPortfolios: "Subcarteiras →",
    openDashboard: "Abrir painel",
    openLiveDashboard: "Abrir painel ao vivo",
    tryDemo: "Experimentar demo",
    browseStrategies: "Modelos de estratégia →",
  },
  home: {
    kicker: "Stellar · Soroban",
    title: "Rebalanceamento automático de carteira, on-chain",
    description:
      "Defina uma alocação-alvo e um limite de desvio. Seu vault Soroban guarda os fundos - nunca um custodiante, nunca este app - e rebalanceia apenas quando o desvio ultrapassa o limite definido.",
    testnetNotice:
      "Atualmente ativo na Stellar testnet. Não auditado - não use com fundos da mainnet.",
  },
  dashboard: {
    title: "Carteira",
    liveFrom: "Ao vivo a partir do vault implantado na Stellar testnet.",
  },
  allocationChart: {
    loadError: (message) =>
      `Não foi possível ler a alocação ao vivo do contrato do vault: ${message}`,
  },
  allocationBars: {
    vsTarget: (current, target) => `${current} vs ${target} alvo`,
    underweight: "abaixo do alvo (subponderado)",
    overweight: "acima do alvo (sobreponderado)",
  },
  depositWithdrawForm: {
    connectToDepositWithdraw: "Conecte uma carteira para depositar ou sacar.",
    deposited: (amount, asset) => `Depositado ${amount} ${asset}.`,
    withdrew: (amount, asset) => `Sacado ${amount} ${asset}.`,
  },
  setTargetsForm: {
    driftHelp: "O rebalanceamento é acionado assim que algum ativo se desvia tanto da meta.",
    connectToChangeTargets: "Conecte uma carteira para alterar as metas.",
    targetsUpdated: "Metas atualizadas.",
  },
  demo: {
    banner: (amount) =>
      `Modo demo - uma carteira simulada de ${amount}. Sem carteira, sem fundos reais, nada aqui afeta o vault implantado. Depósitos/saques e movimentos de preço são apenas locais a esta página.`,
    total: (amount) => `${amount} no total`,
    depositWithdrawSimulate: "Depositar / sacar / simular",
    currentThreshold: (pct) => `Limite atual: ${pct}`,
  },
  demoActions: {
    shockHelp:
      "Simule um movimento de preço para gerar desvio e observe o status acima mudar.",
    rebalanceNow: "Rebalancear agora",
    resetDemo: "Reiniciar demo",
  },
  createPortfolioForm: {
    name: "Nome",
    namePlaceholder: "ex.: Aposentadoria",
    create: "Criar carteira",
    creating: "Criando…",
    deploying:
      "Implantando o vault, inicializando e autorizando o keeper — aprove cada etapa na sua carteira…",
    created: "Carteira criada.",
    createFailed: "Falha ao criar a carteira.",
    connectToCreate: "Conecte uma carteira para criar uma carteira.",
  },
  portfolios: {
    title: "Carteiras",
    subtitle: "Cada carteira é seu próprio vault, implantado e controlado pela sua carteira.",
    connectToSee: "Conecte uma carteira para ver suas carteiras.",
    loadError: (message) => `Não foi possível carregar as carteiras: ${message}`,
    empty: "Ainda não há carteiras — crie uma abaixo.",
    driftThreshold: (pct) => `limite de desvio de ${pct}`,
    createSection: "Criar uma carteira",
  },
  portfolioDetail: {
    vaultAddress: (short) => `Vault ${short}`,
    loadError: (message) => `Não foi possível carregar esta carteira: ${message}`,
    downloadAuditLog: "Baixar registro de auditoria (CSV)",
  },
  whatIfSimulator: {
    title: "Simulador de estresse (e se...)",
    help: "Aplique um choque de preço (em %) a qualquer ativo e rode a simulação para ver o desvio e as operações projetadas - nada aqui é executado on-chain.",
    shockPlaceholder: "ex.: -30",
    run: "Rodar simulação",
    running: "Simulando…",
    wouldRebalance: "Acionaria um rebalanceamento",
    onTarget: "Permaneceria dentro da meta",
    projectedTrades: "Operações projetadas",
    noTrades: "Nenhuma operação necessária.",
    tradeLine: (amount, assetIn, assetOut) => `Vender ${amount} ${assetIn} por ${assetOut}`,
    simulateFailed: (message) => `Falha na simulação: ${message}`,
  },
  publishStrategyForm: {
    title: "Publicar como modelo de estratégia",
    help: "Registra um instantâneo das metas e do limite atuais desta carteira em um modelo público e anonimizado - nunca inclui o proprietário ou o endereço do vault.",
    namePlaceholder: "Nome público opcional (padrão: nome desta carteira)",
    publish: "Publicar como modelo",
    publishing: "Publicando…",
    published: "Publicado — visível na página de modelos de estratégia.",
    publishFailed: "Falha ao publicar.",
  },
  webhookForm: {
    title: "Webhook de gatilho externo",
    help: "Registre uma URL de webhook para a qual seu próprio sistema possa enviar um gatilho assinado, para que esta carteira seja verificada imediatamente em vez de esperar a próxima varredura agendada.",
    urlPlaceholder: "https://exemplo.com/webhook",
    eventTypes: "Notificar também em",
    eventRebalanceCompleted: "Rebalanceamento concluído",
    eventCircuitBreakerTripped: "Disjuntor acionado",
    register: "Registrar webhook",
    registering: "Registrando…",
    registered: "Webhook registrado — copie o segredo agora, ele não será mostrado novamente.",
    secretLabel: "Segredo",
    registerFailed: "Falha ao registrar o webhook.",
  },
  strategyTemplates: {
    title: "Modelos de estratégia",
    subtitle:
      "Explore modelos de alocação-alvo publicados de forma anônima por outras carteiras. Clone um para pré-preencher uma nova carteira - nada aqui é vinculado a quem o publicou.",
    loadError: (message) => `Não foi possível carregar os modelos de estratégia: ${message}`,
    empty: "Ainda não há modelos de estratégia publicados.",
    clone: "Clonar",
  },
};
