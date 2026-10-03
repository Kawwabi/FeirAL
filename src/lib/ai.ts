import "server-only";
import { prisma } from "./prisma";
import { AD_TIER_INFO } from "./constants";
import { authHeaders, resolveAiConfig, type AiConfig, type AiProvider } from "./ai-config";

export { isLoopbackUrl, resolveAiConfig } from "./ai-config";
export type { AiConfig, AiProvider } from "./ai-config";

// Camada de IA do FeirAL.
// Se AI_API_KEY estiver configurada, usa um provedor compatível com a API OpenAI.
// Caso contrário (ou em caso de falha), responde com um assistente local baseado
// nos dados reais da plataforma - garantindo que o chat funcione offline.

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiContext {
  totalFairs: number;
  totalEvents: number;
  cities: string[];
  categories: { name: string; slug: string }[];
  upcoming: { name: string; city: string; slug: string; startsAt: string }[];
  topRated: { name: string; city: string; slug: string; rating: number }[];
}

/** Coleta um resumo do estado atual da plataforma para alimentar a IA. */
export async function buildAiContext(): Promise<AiContext> {
  const [fairs, events, categories] = await Promise.all([
    prisma.fair.findMany({
      where: { status: "PUBLISHED" },
      select: { name: true, city: true, slug: true },
    }),
    prisma.fairEvent.findMany({
      where: { startsAt: { gte: new Date() }, fair: { status: "PUBLISHED" } },
      orderBy: { startsAt: "asc" },
      take: 8,
      select: {
        title: true,
        startsAt: true,
        fair: { select: { name: true, city: true, slug: true } },
      },
    }),
    prisma.category.findMany({ select: { name: true, slug: true } }),
  ]);

  const ratings = await prisma.review.groupBy({
    by: ["fairId"],
    where: { status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const ratingMap = new Map(ratings.map((r) => [r.fairId, r._avg.rating ?? 0]));
  const rated = await prisma.fair.findMany({
    where: { id: { in: ratings.filter((r) => r._count._all >= 1).map((r) => r.fairId) } },
    select: { id: true, name: true, city: true, slug: true },
  });

  const topRated = rated
    .map((f) => ({
      name: f.name,
      city: f.city,
      slug: f.slug,
      rating: Math.round((ratingMap.get(f.id) ?? 0) * 10) / 10,
    }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return {
    totalFairs: fairs.length,
    totalEvents: events.length,
    cities: Array.from(new Set(fairs.map((f) => f.city))).sort(),
    categories,
    upcoming: events.map((e) => ({
      name: e.title,
      city: e.fair.city,
      slug: e.fair.slug,
      startsAt: e.startsAt.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    topRated,
  };
}

const SYSTEM_PROMPT = `Você é a FeiraIA, assistente virtual da plataforma FeirAL, que reúne feirinhas de Alagoas.
Ajude visitantes a descobrir feirinhas, categorias (artesanato, alimentos, moda, eventos culturais),
agenda de eventos, como avaliar, como seguir uma feirinha e como organizadores cadastram/anunciam.
Responda em português do Brasil, de forma cordial, objetiva e com no máximo 4 frases.
Se não souber, oriente o usuário a navegar pelas páginas "Feirinhas", "Mapa", "Agenda" e "Categorias".`;

function contextSummary(ctx: AiContext): string {
  const lines = [
    `Total de feirinhas publicadas: ${ctx.totalFairs}.`,
    `Cidades com feirinhas: ${ctx.cities.join(", ") || "nenhuma"}.`,
    `Categorias: ${ctx.categories.map((c) => c.name).join(", ") || "nenhuma"}.`,
  ];
  if (ctx.upcoming.length) {
    lines.push(
      `Próximos eventos: ${ctx.upcoming
        .slice(0, 5)
        .map((e) => `${e.name} (${e.city}, ${e.startsAt})`)
        .join("; ")}.`,
    );
  }
  if (ctx.topRated.length) {
    lines.push(
      `Mais bem avaliadas: ${ctx.topRated.map((f) => `${f.name} - nota ${f.rating}`).join("; ")}.`,
    );
  }
  return lines.join(" ");
}

/** Assistente local (fallback sem chave de API). Usa regras simples sobre o contexto. */
export function localAssistant(message: string, ctx: AiContext): string {
  const q = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const has = (...terms: string[]) => terms.some((t) => q.includes(t));

  if (has("oi", "olá", "bom dia", "boa tarde", "boa noite", "ajuda")) {
    return `Olá! Sou a FeiraIA. Hoje há ${ctx.totalFairs} feirinhas publicadas em ${ctx.cities.length} cidades de Alagoas. Posso ajudar com agenda, categorias, mapa ou como avaliar uma feirinha.`;
  }
  if (has("agenda", "evento", "quando", "data", "programação")) {
    if (ctx.upcoming.length === 0) return "Ainda não há eventos futuros cadastrados. Volte em breve!";
    return `Próximos eventos: ${ctx.upcoming
      .slice(0, 3)
      .map((e) => `${e.name} em ${e.city} (${e.startsAt})`)
      .join("; ")}. Veja a página Agenda para o calendário completo.`;
  }
  if (has("artesanato", "aliment", "comida", "moda", "cultur", "categoria", "plant", "antiguidade")) {
    return `Temos estas categorias: ${ctx.categories.map((c) => c.name).join(", ")}. Use os filtros em "Feirinhas" ou o "Mapa" para combinar categoria, cidade e data.`;
  }
  if (has("mapa", "onde", "local", "perto", "cidade")) {
    return `No Mapa interativo você vê todas as feirinhas e filtra por localização, data e tipo. Cidades disponíveis: ${ctx.cities.slice(0, 6).join(", ")}.`;
  }
  if (has("avalia", "nota", "comentar", "comentário", "review")) {
    return "Crie sua conta, abra uma feirinha e use a seção de avaliações (1 a 5 estrelas) e comentários. Suas opiniões ajudam outras pessoas a escolher!";
  }
  if (has("anunci", "patrocin", "promover", "divulgar", "destaque")) {
    const tiers = Object.values(AD_TIER_INFO).map((t) => t.label).join(", ");
    return `Organizadores podem promover feirinhas com anúncios patrocinados. Temos os planos ${tiers}. Acesse "Painel do organizador > Anúncios".`;
  }
  if (has("cadastr", "criar feirinha", "organizador", "registrar")) {
    return "Para cadastrar uma feirinha, crie uma conta como organizador, acesse o Painel e clique em Nova feirinha. Informe nome, descrição, local, categorias, produtos e agenda de eventos.";
  }
  if (ctx.topRated.length) {
    return `As feirinhas mais bem avaliadas agora são: ${ctx.topRated
      .slice(0, 3)
      .map((f) => `${f.name} (${f.city}, nota ${f.rating})`)
      .join("; ")}.`;
  }
  return `Sou a FeiraIA. No momento há ${ctx.totalFairs} feirinhas publicadas. Pergunte sobre agenda, categorias, mapa de localização, avaliações ou como anunciar sua feirinha.`;
}

/* ---------------- Provedores de IA ---------------- */
// Tipos e resolução de configuração vivem em ./ai-config (módulo puro e testável).
// Aqui ficam apenas as chamadas HTTP e a estratégia de fallback.

async function requestJson(url: string, init: RequestInit, timeoutMs: number): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Provedores compatíveis com OpenAI (KoboldCpp /v1, Ollama, LM Studio, OpenAI). */
async function callOpenAiCompatible(
  config: AiConfig,
  turns: ChatTurn[],
  ctx: AiContext,
): Promise<string | null> {
  const json = await requestJson(
    `${config.baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        max_tokens: 320,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `Contexto atual da plataforma: ${contextSummary(ctx)}` },
          ...turns.slice(-8),
        ],
      }),
    },
    config.timeoutMs,
  );

  if (!json) return null;
  const data = json as { choices?: { message?: { content?: string }; text?: string }[] };
  const content = data.choices?.[0]?.message?.content ?? data.choices?.[0]?.text;
  return content?.trim() || null;
}

/** Endpoint nativo do KoboldCpp (POST /api/v1/generate). */
async function callKoboldNative(
  config: AiConfig,
  turns: ChatTurn[],
  ctx: AiContext,
): Promise<string | null> {
  // Aceita tanto "http://localhost:5001" quanto "http://localhost:5001/v1".
  const root = config.baseUrl.replace(/\/v1$/, "");

  const transcript = turns
    .slice(-8)
    .map((t) => `${t.role === "user" ? "Usuário" : "FeiraIA"}: ${t.content}`)
    .join("\n");

  const prompt = [
    SYSTEM_PROMPT,
    `Contexto atual da plataforma: ${contextSummary(ctx)}`,
    "",
    transcript,
    "FeiraIA:",
  ].join("\n");

  const json = await requestJson(
    `${root}/api/v1/generate`,
    {
      method: "POST",
      headers: authHeaders(config),
      body: JSON.stringify({
        prompt,
        max_context_length: 4096,
        max_length: 320,
        temperature: 0.4,
        top_p: 0.9,
        rep_pen: 1.1,
        rep_pen_range: 512,
        stop_sequence: ["\nUsuario:", "\nFeiraIA:", "<|eot_id|>", "</s>"],
      }),
    },
    config.timeoutMs,
  );

  if (!json) return null;
  const data = json as { results?: { text?: string }[] };
  return data.results?.[0]?.text?.trim() || null;
}

export interface AssistantResult {
  text: string;
  engine: "llm" | "local";
  provider: AiProvider;
}

/** Gera a resposta: usa o provedor configurado e cai no assistente local em caso de falha. */
export async function generateAssistantReplyDetailed(
  turns: ChatTurn[],
  ctx: AiContext,
): Promise<AssistantResult> {
  const config = resolveAiConfig();
  const lastUser = [...turns].reverse().find((t) => t.role === "user")?.content ?? "";

  if (config.provider === "none") {
    return { text: localAssistant(lastUser, ctx), engine: "local", provider: config.provider };
  }

  const remote =
    config.provider === "kobold"
      ? await callKoboldNative(config, turns, ctx)
      : await callOpenAiCompatible(config, turns, ctx);

  if (remote) {
    return { text: remote, engine: "llm", provider: config.provider };
  }
  return { text: localAssistant(lastUser, ctx), engine: "local", provider: config.provider };
}

/** Compatibilidade: retorna apenas o texto da resposta. */
export async function generateAssistantReply(turns: ChatTurn[], ctx: AiContext): Promise<string> {
  return (await generateAssistantReplyDetailed(turns, ctx)).text;
}

export interface AiStatus {
  provider: AiProvider;
  baseUrl: string;
  model: string;
  requiresKey: boolean;
  hasKey: boolean;
  reachable: boolean | null;
}

/** Verifica o provedor configurado e se o endpoint de IA está acessível. */
export async function probeAiStatus(): Promise<AiStatus> {
  const config = resolveAiConfig();
  let reachable: boolean | null = null;

  if (config.provider !== "none") {
    const root = config.provider === "kobold" ? config.baseUrl.replace(/\/v1$/, "") : config.baseUrl;
    const path = config.provider === "kobold" ? "/api/v1/model" : "/models";
    const json = await requestJson(
      `${root}${path}`,
      { method: "GET", headers: authHeaders(config) },
      4000,
    );
    reachable = json !== null;
  }

  return {
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    requiresKey: config.provider === "openai",
    hasKey: Boolean(config.apiKey),
    reachable,
  };
}