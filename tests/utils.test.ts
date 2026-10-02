import { describe, expect, it } from "vitest";
import { coverImage, formatBRL, haversineKm, slugify, toIsoDateInput, truncate } from "@/lib/utils";

describe("slugify", () => {
  it("remove acentos, espacos e caracteres especiais", () => {
    expect(slugify("Feira de Artesanato da Paçucara")).toBe("feira-de-artesanato-da-pacucara");
  });

  it("remove hifens nas extremidades", () => {
    expect(slugify("  --FeirAL--  ")).toBe("feiral");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(slugify("")).toBe("");
  });
});

describe("haversineKm", () => {
  it("retorna 0 para o mesmo ponto", () => {
    expect(haversineKm(-9.6658, -35.7353, -9.6658, -35.7353)).toBe(0);
  });

  it("calcula distancia aproximada entre Maceio e Arapiraca (~130 km)", () => {
    const km = haversineKm(-9.6658, -35.7353, -9.7525, -36.6611);
    expect(km).toBeGreaterThan(90);
    expect(km).toBeLessThan(120);
  });
});

describe("formatBRL", () => {
  it("formata centavos como Real", () => {
    expect(formatBRL(12900).replace(/\u00a0/g, " ")).toBe("R$ 129,00");
  });
});

describe("toIsoDateInput", () => {
  it("formata uma data no padrao do input type=date", () => {
    expect(toIsoDateInput(new Date(2026, 2, 5))).toBe("2026-03-05");
  });
});

describe("coverImage", () => {
  it("usa a imagem padrao quando nao ha capa", () => {
    expect(coverImage(null)).toBe("/covers/default.svg");
    expect(coverImage("")).toBe("/covers/default.svg");
    expect(coverImage("/covers/moda.svg")).toBe("/covers/moda.svg");
  });
});

describe("truncate", () => {
  it("mantem textos curtos intactos", () => {
    expect(truncate("curto", 20)).toBe("curto");
  });

  it("corta textos longos adicionando reticencias", () => {
    const result = truncate("a".repeat(50), 10);
    expect(result.length).toBe(10);
    expect(result.endsWith("…")).toBe(true);
  });
});