import "server-only";
import { prisma } from "./prisma";
import { AD_TIER_INFO } from "./constants";

// Camada de IA do FeirAL.
// Se AI_API_KEY estiver configurada, usa um provedor compativel com a API OpenAI.
// Caso contrario (ou em caso de falha), responde com um assistente local baseado
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

const SYSTEM_PROMPT = `Voce e a FeiraIA, assistente virtual da plataforma FeirAL, que reune feirinhas de Alagoas.
Ajude visitantes a descobrir feirinhas, categorias (artesanato, alimentos, moda, eventos culturais),
agenda de eventos, como avaliar, como seguir uma feirinha e como organizadores cadastram/anunciam.
Responda em portugues do Brasil, de forma cordial, objetiva e com no maximo 4 frases.
Se nao souber, oriente o usuario a navegar pelas paginas "Feirinhas", "Mapa", "Agenda" e "Categorias".`;

function contextSummary(ctx: AiContext): string {
  const lines = [
    `Total de feirinhas publicadas: ${ctx.totalFairs}.`,
    `Cidades com feirinhas: ${ctx.cities.join(", ") || "nenhuma"}.`,
    `Categorias: ${ctx.categories.map((c) => c.name).join(", ") || "nenhuma"}.`,
  ];
  if (ctx.upcoming.length) {
    lines.push(
      `Proximos eventos: ${ctx.upcoming
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

  if (has("oi", "ola", "bom dia", "boa tarde", "boa noite", "ajuda")) {
    return `Ola! Sou a FeiraIA. Hoje ha ${ctx.totalFairs} feirinhas publicadas em ${ctx.cities.length} cidades de Alagoas. Posso ajudar com agenda, categorias, mapa ou como avaliar uma feirinha.`;
  }
  if (has("agenda", "evento", "quando", "data", "programacao")) {
    if (ctx.upcoming.length === 0) return "Ainda nao ha eventos futuros cadastrados. Volte em breve!";
    return `Proximos eventos: ${ctx.upcoming
      .slice(0, 3)
      .map((e) => `${e.name} em ${e.city} (${e.startsAt})`)
      .join("; ")}. Veja a pagina Agenda para o calendario completo.`;
  }
  if (has("artesanato", "aliment", "comida", "moda", "cultur", "categoria", "plant", "antiguidade")) {
    return `Temos estas categorias: ${ctx.categories.map((c) => c.name).join(", ")}. Use os filtros em "Feirinhas" ou o "Mapa" para combinar categoria, cidade e data.`;
  }
  if (has("mapa", "onde", "local", "perto", "cidade")) {
    return `No Mapa interativo voce ve todas as feirinhas e filtra por localizacao, data e tipo. Cidades disponiveis: ${ctx.cities.slice(0, 6).join(", ")}.`;
  }
  if (has("avalia", "nota", "comentar", "comentario", "review")) {
    return "Crie sua conta, abra uma feirinha e use a secao de avaliacoes (1 a 5 estrelas) e comentarios. Suas opinioes ajudam outras pessoas a escolher!";
  }
  if (has("anunci", "patrocin", "promover", "divulgar", "destaque")) {
    const tiers = Object.values(AD_TIER_INFO).map((t) => t.label).join(", ");
    return `Organizadores podem promover feirinhas com anuncios patrocinados. Temos os planos ${tiers}. Acesse "Painel do organizador > Anuncios".`;
  }
  if (has("cadastr", "criar feirinha", "organizador", "registrar")) {
    return "Para cadastrar uma feirinha, crie uma conta como organizador, acesse o Painel e clique em Nova feirinha. Informe nome, descricao, local, categorias, produtos e agenda de eventos.";
  }
  if (ctx.topRated.length) {
    return `As feirinhas mais bem avaliadas agora sao: ${ctx.topRated
      .slice(0, 3)
      .map((f) => `${f.name} (${f.city}, nota ${f.rating})`)
      .join("; ")}.`;
  }
  return `Sou a FeiraIA. No momento ha ${ctx.totalFairs} feirinhas publicadas. Pergunte sobre agenda, categorias, mapa de localizacao, avaliacoes ou como anunciar sua feirinha.`;
}

async function callOpenAiApi(turns: ChatTurn[], ctx: AiContext): Promise<string | null> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 320,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `Contexto atual da plataforma: ${contextSummary(ctx)}` },
          ...turns.slice(-8),
        ],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

/** Gera a resposta do assistente: tenta a IA externa e cai no assistente local. */
export async function generateAssistantReply(turns: ChatTurn[], ctx: AiContext): Promise<string> {
  const lastUser = [...turns].reverse().find((t) => t.role === "user")?.content ?? "";
  const remote = await callOpenAiApi(turns, ctx);
  return remote ?? localAssistant(lastUser, ctx);
}