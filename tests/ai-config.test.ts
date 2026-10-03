import { describe, expect, it } from "vitest";
import { authHeaders, isLoopbackUrl, resolveAiConfig } from "@/lib/ai-config";

describe("isLoopbackUrl", () => {
  it("reconhece enderecos locais (LLM local)", () => {
    expect(isLoopbackUrl("http://localhost:5001/v1")).toBe(true);
    expect(isLoopbackUrl("http://127.0.0.1:11434/v1")).toBe(true);
    expect(isLoopbackUrl("http://0.0.0.0:1234/v1")).toBe(true);
    expect(isLoopbackUrl("http://minha-maquina.local:5001")).toBe(true);
  });

  it("recusa enderecos remotos e invalidos", () => {
    expect(isLoopbackUrl("https://api.openai.com/v1")).toBe(false);
    expect(isLoopbackUrl("nao-e-url")).toBe(false);
  });
});

describe("resolveAiConfig", () => {
  it("sem variaveis, nao exige chave nem usa LLM (provider none)", () => {
    const config = resolveAiConfig({});
    expect(config.provider).toBe("none");
    expect(config.apiKey).toBeNull();
    expect(config.model).toBe("gpt-4o-mini");
    expect(config.timeoutMs).toBe(60000);
  });

  it("LLM local funciona SEM chave de API (caso principal)", () => {
    const config = resolveAiConfig({
      AI_BASE_URL: "http://localhost:5001/v1",
      AI_MODEL: "koboldcpp",
    });
    expect(config.provider).toBe("local");
    expect(config.apiKey).toBeNull();
    expect(config.model).toBe("koboldcpp");
  });

  it("modo kobold usa o endpoint nativo tambem sem chave", () => {
    const config = resolveAiConfig({
      AI_PROVIDER: "kobold",
      AI_BASE_URL: "http://localhost:5001",
    });
    expect(config.provider).toBe("kobold");
    expect(config.apiKey).toBeNull();
  });

  it("modo kobold usa timeout padrao de 500s (LLM local lento)", () => {
    expect(resolveAiConfig({ AI_PROVIDER: "kobold" }).timeoutMs).toBe(500_000);
    expect(resolveAiConfig({ AI_PROVIDER: "koboldcpp" }).timeoutMs).toBe(500_000);
  });

  it("AI_TIMEOUT_MS sobrepoe o timeout padrao do kobold", () => {
    const config = resolveAiConfig({ AI_PROVIDER: "kobold", AI_TIMEOUT_MS: "120000" });
    expect(config.timeoutMs).toBe(120_000);
  });

  it("demais provedores mantem o timeout padrao de 60s", () => {
    expect(resolveAiConfig({ AI_PROVIDER: "local" }).timeoutMs).toBe(60_000);
    expect(resolveAiConfig({ AI_PROVIDER: "openai" }).timeoutMs).toBe(60_000);
    expect(resolveAiConfig({}).timeoutMs).toBe(60_000);
  });

  it("modo auto escolhe openai quando ha chave e endpoint remoto", () => {
    const config = resolveAiConfig({
      AI_BASE_URL: "https://api.openai.com/v1",
      AI_API_KEY: "sk-teste",
    });
    expect(config.provider).toBe("openai");
    expect(config.apiKey).toBe("sk-teste");
  });

  it("modo auto prioriza LLM local mesmo com chave preenchida", () => {
    const config = resolveAiConfig({
      AI_BASE_URL: "http://localhost:5001/v1",
      AI_API_KEY: "senha-do-koboldcpp",
    });
    expect(config.provider).toBe("local");
  });

  it("modo openai explicito exige chave (requiresKey)", () => {
    const config = resolveAiConfig({ AI_PROVIDER: "openai", AI_BASE_URL: "https://api.openai.com/v1" });
    expect(config.provider).toBe("openai");
    expect(config.apiKey).toBeNull();
  });

  it("modo none desliga o LLM", () => {
    expect(resolveAiConfig({ AI_PROVIDER: "none" }).provider).toBe("none");
    expect(resolveAiConfig({ AI_PROVIDER: "off" }).provider).toBe("none");
  });

  it("remove barra final da URL e aceita timeout customizado", () => {
    const config = resolveAiConfig({
      AI_BASE_URL: "http://localhost:5001/v1/",
      AI_TIMEOUT_MS: "90000",
    });
    expect(config.baseUrl).toBe("http://localhost:5001/v1");
    expect(config.timeoutMs).toBe(90000);
  });

  it("trata timeout invalido e modelo vazio com valores padrao", () => {
    const config = resolveAiConfig({ AI_TIMEOUT_MS: "abc", AI_MODEL: "   " });
    expect(config.timeoutMs).toBe(60000);
    expect(config.model).toBe("gpt-4o-mini");
  });

  it("ignora chave em branco", () => {
    const config = resolveAiConfig({ AI_API_KEY: "   ", AI_BASE_URL: "https://api.openai.com/v1" });
    expect(config.apiKey).toBeNull();
    expect(config.provider).toBe("none");
  });
});

describe("authHeaders", () => {
  it("nao envia Authorization quando nao ha chave (LLM local)", () => {
    const headers = authHeaders(resolveAiConfig({ AI_BASE_URL: "http://localhost:5001/v1" }));
    expect(headers.Authorization).toBeUndefined();
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("envia Bearer quando a chave existe", () => {
    const headers = authHeaders(resolveAiConfig({ AI_API_KEY: "sk-123" }));
    expect(headers.Authorization).toBe("Bearer sk-123");
  });
});