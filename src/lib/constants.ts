// Constantes de dominio da plataforma FeirAL.

export const ROLES = {
  VISITOR: "VISITOR",
  ORGANIZER: "ORGANIZER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  VISITOR: "Visitante",
  ORGANIZER: "Organizador",
  ADMIN: "Administrador",
};

export const FAIR_STATUS = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;

export type FairStatus = (typeof FAIR_STATUS)[keyof typeof FAIR_STATUS];

export const FAIR_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando revisao",
  PUBLISHED: "Publicada",
  REJECTED: "Rejeitada",
  ARCHIVED: "Arquivada",
};

export const CONTENT_STATUS = {
  PUBLISHED: "PUBLISHED",
  PENDING: "PENDING",
  HIDDEN: "HIDDEN",
} as const;

export const REPORT_STATUS: Record<string, string> = {
  OPEN: "Aberta",
  RESOLVED: "Resolvida",
  DISMISSED: "Arquivada",
};

export const REPORT_TARGETS = ["FAIR", "REVIEW", "COMMENT", "FEEDBACK", "USER"] as const;
export type ReportTarget = (typeof REPORT_TARGETS)[number];

export const AD_TIERS = {
  BASIC: "BASIC",
  STANDARD: "STANDARD",
  PREMIUM: "PREMIUM",
} as const;

export type AdTier = (typeof AD_TIERS)[keyof typeof AD_TIERS];

export const AD_TIER_INFO: Record<
  string,
  { label: string; priceCents: number; impressionsPerDay: number; color: string; perks: string[] }
> = {
  BASIC: {
    label: "Basico",
    priceCents: 4900,
    impressionsPerDay: 500,
    color: "#0ea5e9",
    perks: ["Exibicao na pagina de feirinhas", "Metricas de impressoes"],
  },
  STANDARD: {
    label: "Padrao",
    priceCents: 12900,
    impressionsPerDay: 2000,
    color: "#f97316",
    perks: ["Destaque na pagina inicial", "Metricas de impressoes e cliques", "Selo de feirinha parceira"],
  },
  PREMIUM: {
    label: "Premium",
    priceCents: 29900,
    impressionsPerDay: 6000,
    color: "#a855f7",
    perks: [
      "Topo da pagina inicial",
      "Banner na agenda de eventos",
      "Metricas completas",
      "Selo de feirinha parceira",
      "Apoio na criacao do anuncio",
    ],
  },
};

export const OFFERING_KINDS: Record<string, string> = {
  PRODUCT: "Produto",
  SERVICE: "Servico",
};

// Categorias iniciais da plataforma (tambem cadastradas via seed).
export const DEFAULT_CATEGORIES = [
  {
    slug: "artesanato",
    name: "Artesanato",
    icon: "🎨",
    color: "#f59e0b",
    description: "Artesanato local, ceramica, renda, palha e trabalhos manuais alagoanos.",
  },
  {
    slug: "alimentos",
    name: "Alimentos",
    icon: "🍲",
    color: "#ef4444",
    description: "Comida de rua, doces, queijos, frutos do mar e produtos da agricultura familiar.",
  },
  {
    slug: "moda",
    name: "Moda",
    icon: "👗",
    color: "#ec4899",
    description: "Roupas, acessorios, calcados e brecho com estilo regional.",
  },
  {
    slug: "eventos-culturais",
    name: "Eventos Culturais",
    icon: "🎭",
    color: "#8b5cf6",
    description: "Musica, forro, literatura de cordel, teatro e manifestacoes culturais.",
  },
  {
    slug: "flores-e-plantas",
    name: "Flores e Plantas",
    icon: "🌿",
    color: "#22c55e",
    description: "Mudas, flores, paisagismo e plantas ornamentais.",
  },
  {
    slug: "antiguidades",
    name: "Antiguidades e Colecionaveis",
    icon: "🕰️",
    color: "#64748b",
    description: "Pecas antigas, discos de vinil, livros usados e colecionaveis.",
  },
] as const;

export const CITIES_AL = [
  "Maceio",
  "Arapiraca",
  "Rio Largo",
  "Palmeira dos Indios",
  "Uniao dos Palmares",
  "Penedo",
  "Pilar",
  "Sao Miguel dos Campos",
  "Delmiro Gouveia",
  "Coruripe",
  "Marechal Deodoro",
  "Santana do Ipanema",
  "Girau do Ponciano",
  "Barra de Sao Miguel",
  "Paripueira",
  "Murici",
  "Porto Calvo",
  "Viçosa",
  "Olho d'Agua das Flores",
  "Traipu",
] as const;

export const REPORT_REASONS = [
  "Informacao incorreta",
  "Conteudo ofensivo",
  "Feirinha inexistente ou fraudulenta",
  "Spam ou propaganda enganosa",
  "Outro",
] as const;

export const NOTIFICATION_TYPES = {
  NEW_EVENT: "NEW_EVENT",
  FAIR_PUBLISHED: "FAIR_PUBLISHED",
  REVIEW_REPLY: "REVIEW_REPLY",
  MODERATION: "MODERATION",
  AD_UPDATE: "AD_UPDATE",
  SYSTEM: "SYSTEM",
} as const;