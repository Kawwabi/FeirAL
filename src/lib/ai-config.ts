// Configuração de IA do FeirAL - módulo puro (sem dependência de runtime do servidor),
// o que permite testá-lo unitariamente em tests/ai-config.test.ts.

export type AiProvider = "openai" | "local" | "kobold" | "none";

export interface AiConfig {
  provider: AiProvider;
  baseUrl: string;
  model: string;
  apiKey: string | null;
  timeoutMs: number;
}

/** Detecta se a URL aponta para a própria maquina (LLM local). */
export function isLoopbackUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return (
      ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(host) || host.endsWith(".local")
    );
  } catch {
    return false;
  }
}

/**
 * Resolve a configuração de IA a partir das variaveis de ambiente.
 *
 * AI_PROVIDER:
 *  - auto   (padrão) -> nuvem se houver chave E endpoint remoto; senão LLM local se o endpoint for local
 *  - local           -> endpoint compatível com OpenAI, SEM exigir chave
 *                       (KoboldCpp /v1, Ollama, LM Studio)
 *  - kobold          -> endpoint nativo do KoboldCpp (/api/v1/generate), SEM exigir chave
 *  - openai          -> nuvem, EXIGE AI_API_KEY
 *  - none            -> usa somente o assistente local por regras (offline)
 *
 * Endpoints locais (localhost) nunca exigem chave de API.
 */
export function resolveAiConfig(env: Record<string, string | undefined> = process.env): AiConfig {
  const raw = (env.AI_PROVIDER ?? "auto").toLowerCase().trim();
  const baseUrl = (env.AI_BASE_URL ?? "https://api.openai.com/v1").trim().replace(/\/+$/, "");
  const model = (env.AI_MODEL ?? "gpt-4o-mini").trim() || "gpt-4o-mini";
  const apiKey = env.AI_API_KEY?.trim() ? env.AI_API_KEY.trim() : null;
  // No KoboldCpp nativo, modelos grandes rodando em hardware modesto (ex.: parcialmente
  // offloaded para a RAM) podem levar bastante tempo para gerar. Nesse modo o padrao
  // é 500s; nos demais, 60s. AI_TIMEOUT_MS sempre tem prioridade sobre o padrao.
  const defaultTimeoutMs = raw === "kobold" || raw === "koboldcpp" ? 500_000 : 60_000;
  const timeoutMs = Number(env.AI_TIMEOUT_MS ?? defaultTimeoutMs) || defaultTimeoutMs;

  let provider: AiProvider;
  if (raw === "kobold" || raw === "koboldcpp") provider = "kobold";
  else if (raw === "openai") provider = "openai";
  else if (raw === "local") provider = "local";
  else if (raw === "none" || raw === "off" || raw === "rules") provider = "none";
  else if (apiKey && !isLoopbackUrl(baseUrl)) provider = "openai";
  else if (isLoopbackUrl(baseUrl)) provider = "local";
  else provider = "none";

  return { provider, baseUrl, model, apiKey, timeoutMs };
}

/** Header de autenticação: só enviamos Authorization quando existe chave. */
export function authHeaders(config: AiConfig): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  return headers;
}