import { z } from "zod";
import { ROLES, FAIR_STATUS, AD_TIERS, REPORT_TARGETS, OFFERING_KINDS } from "./constants";

const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().optional(),
);

const optionalString = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().optional(),
);

const optionalEmail = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.string().email("E-mail invalido").optional(),
);

export const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome completo."),
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
  role: z.enum([ROLES.VISITOR, ROLES.ORGANIZER]).default(ROLES.VISITOR),
  city: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe a senha."),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  city: z.string().optional(),
  bio: z.string().max(400, "A bio deve ter no maximo 400 caracteres.").optional(),
  avatarUrl: z.string().optional(),
});

export const preferencesSchema = z.object({
  emailEnabled: z.coerce.boolean().default(false),
  pushEnabled: z.coerce.boolean().default(false),
  newEvents: z.coerce.boolean().default(false),
  reviewReplies: z.coerce.boolean().default(false),
  weeklyDigest: z.coerce.boolean().default(false),
  preferredCity: z.string().optional(),
  preferredCategories: z.string().optional(),
});

const offeringSchema = z.object({
  name: z.string().min(2, "Nome do item muito curto."),
  kind: z.enum([OFFERING_KINDS.PRODUCT, OFFERING_KINDS.SERVICE]).default(OFFERING_KINDS.PRODUCT),
  description: z.string().optional(),
  priceRange: z.string().optional(),
});

const eventSchema = z.object({
  title: z.string().min(2, "Informe o titulo do evento."),
  startsAt: z.string().min(1, "Informe a data/hora de inicio."),
  endsAt: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const fairSchema = z.object({
  name: z.string().min(3, "O nome precisa ter ao menos 3 caracteres."),
  shortDescription: z.string().max(180, "Resumo muito longo.").optional(),
  description: z.string().min(20, "Descreva a feirinha com ao menos 20 caracteres."),
  address: z.string().min(3, "Informe o endereco."),
  city: z.string().min(2, "Informe a cidade."),
  state: z.string().default("AL"),
  zipCode: optionalString,
  latitude: optionalNumber,
  longitude: optionalNumber,
  coverImageUrl: optionalString,
  contactEmail: optionalEmail,
  contactPhone: optionalString,
  websiteUrl: optionalString,
  instagramUrl: optionalString,
  categories: z.array(z.string()).default([]),
  offerings: z.array(offeringSchema).default([]),
  events: z.array(eventSchema).default([]),
});

export const reviewSchema = z.object({
  fairId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Escolha de 1 a 5 estrelas.").max(5),
  title: z.string().max(120, "Titulo muito longo.").optional(),
  content: z.string().min(5, "Escreva pelo menos 5 caracteres."),
  visitedAt: z.string().optional(),
});

export const commentSchema = z.object({
  fairId: z.string().min(1),
  parentId: z.string().optional(),
  content: z.string().min(2, "Escreva um comentario."),
});

export const feedbackSchema = z.object({
  fairId: z.string().min(1),
  experience: z.string().min(5, "Conte como foi sua experiencia."),
  suggestions: z.string().optional(),
  wouldParticipateAgain: z.coerce.boolean().default(false),
  organizationScore: z.coerce.number().int().min(1).max(5).default(5),
});

export const adSchema = z.object({
  fairId: z.string().min(1, "Selecione a feirinha."),
  title: z.string().min(3, "Informe um titulo para o anuncio."),
  description: z.string().max(240, "Descricao muito longa.").optional(),
  imageUrl: z.string().optional(),
  tier: z.enum([AD_TIERS.BASIC, AD_TIERS.STANDARD, AD_TIERS.PREMIUM]).default(AD_TIERS.BASIC),
  startsAt: z.string().min(1, "Informe a data de inicio."),
  endsAt: z.string().min(1, "Informe a data de termino."),
});

export const reportSchema = z.object({
  targetType: z.enum(REPORT_TARGETS),
  targetId: z.string().min(1),
  reason: z.string().min(3, "Selecione o motivo."),
  details: z.string().max(500, "Detalhes muito longos.").optional(),
});

export const fairStatusSchema = z.enum([
  FAIR_STATUS.DRAFT,
  FAIR_STATUS.PENDING_REVIEW,
  FAIR_STATUS.PUBLISHED,
  FAIR_STATUS.REJECTED,
  FAIR_STATUS.ARCHIVED,
]);

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Informe um e-mail valido."),
});

export const passwordResetSchema = z.object({
  token: z.string().min(10, "Token invalido."),
  password: z.string().min(6, "A nova senha precisa ter ao menos 6 caracteres."),
});

export type FairInput = z.infer<typeof fairSchema>;
export type OfferingInput = z.infer<typeof offeringSchema>;
export type EventInput = z.infer<typeof eventSchema>;