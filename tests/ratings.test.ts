import { describe, expect, it } from "vitest";
import { averageOf, distributionPercentages, summarizeRatings } from "@/lib/ratings";

describe("summarizeRatings", () => {
  it("retorna zeros quando nao ha avaliacoes", () => {
    const summary = summarizeRatings([]);
    expect(summary.average).toBe(0);
    expect(summary.count).toBe(0);
  });

  it("calcula media arredondada para 1 casa decimal", () => {
    const summary = summarizeRatings([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);
    expect(summary.average).toBe(4.3);
    expect(summary.count).toBe(3);
  });

  it("ignora avaliacoes ocultas (status HIDDEN)", () => {
    const summary = summarizeRatings([
      { rating: 5, status: "PUBLISHED" },
      { rating: 1, status: "HIDDEN" },
    ]);
    expect(summary.count).toBe(1);
    expect(summary.average).toBe(5);
  });

  it("ignora notas fora do intervalo 1-5", () => {
    const summary = summarizeRatings([{ rating: 7 }, { rating: 0 }, { rating: 3 }]);
    expect(summary.count).toBe(1);
    expect(summary.average).toBe(3);
  });

  it("monta a distribuicao por estrela", () => {
    const summary = summarizeRatings([{ rating: 5 }, { rating: 5 }, { rating: 2 }]);
    expect(summary.distribution[5]).toBe(2);
    expect(summary.distribution[2]).toBe(1);
    expect(summary.distribution[4]).toBe(0);
  });
});

describe("distributionPercentages", () => {
  it("calcula percentuais somando aproximadamente 100", () => {
    const percentages = distributionPercentages({ 1: 0, 2: 1, 3: 0, 4: 1, 5: 2 });
    expect(percentages[5]).toBe(50);
    expect(percentages[2]).toBe(25);
    expect(percentages[4]).toBe(25);
  });

  it("retorna zeros quando a distribuicao esta vazia", () => {
    const percentages = distributionPercentages({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
    expect(Object.values(percentages).every((v) => v === 0)).toBe(true);
  });
});

describe("averageOf", () => {
  it("retorna 0 para lista vazia", () => {
    expect(averageOf([])).toBe(0);
  });

  it("calcula a media com 1 casa decimal", () => {
    expect(averageOf([5, 4, 4])).toBe(4.3);
  });
});