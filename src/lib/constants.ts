// Constantes de domínio da plataforma FeirAL.

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
  PENDING_REVIEW: "Aguardando revisão",
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
    label: "Básico",
    priceCents: 4900,
    impressionsPerDay: 500,
    color: "#0ea5e9",
    perks: ["Exibição na página de feirinhas", "Métricas de impressões"],
  },
  STANDARD: {
    label: "Padrão",
    priceCents: 12900,
    impressionsPerDay: 2000,
    color: "#FF7001",
    perks: ["Destaque na página inicial", "Métricas de impressões e cliques", "Selo de feirinha parceira"],
  },
  PREMIUM: {
    label: "Premium",
    priceCents: 29900,
    impressionsPerDay: 6000,
    color: "#a855f7",
    perks: [
      "Topo da página inicial",
      "Banner na agenda de eventos",
      "Métricas completas",
      "Selo de feirinha parceira",
      "Apoio na criação do anúncio",
    ],
  },
};

export const OFFERING_KINDS: Record<string, string> = {
  PRODUCT: "Produto",
  SERVICE: "Serviço",
};

// Categorias iniciais da plataforma (também cadastradas via seed).
export const DEFAULT_CATEGORIES = [
  {
    slug: "artesanato",
    name: "Artesanato",
    icon: "🎨",
    color: "#f59e0b",
    description: "Artesanato local, cerâmica, renda, palha e trabalhos manuais alagoanos.",
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
    description: "Roupas, acessórios, calçados e brechó com estilo regional.",
  },
  {
    slug: "eventos-culturais",
    name: "Eventos Culturais",
    icon: "🎭",
    color: "#8b5cf6",
    description: "Música, forro, literatura de cordel, teatro e manifestações culturais.",
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
    name: "Antiguidades e Colecionáveis",
    icon: "🕰️",
    color: "#64748b",
    description: "Peças antigas, discos de vinil, livros usados e colecionáveis.",
  },
] as const;

export const CITIES_AL = [
  "Maceió",
  "Arapiraca",
  "Rio Largo",
  "Palmeira dos Índios",
  "União dos Palmares",
  "Penedo",
  "Pilar",
  "São Miguel dos Campos",
  "Delmiro Gouveia",
  "Coruripe",
  "Marechal Deodoro",
  "Santana do Ipanema",
  "Girau do Ponciano",
  "Barra de São Miguel",
  "Paripueira",
  "Murici",
  "Porto Calvo",
  "Viçosa",
  "Olho d'Água das Flores",
  "Traipu",
] as const;

export const REPORT_REASONS = [
  "Informação incorreta",
  "Conteúdo ofensivo",
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