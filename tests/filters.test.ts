import { describe, expect, it } from "vitest";
import { countByCategory, cityOptions, filterFairs, sortByNextEvent, type FilterableFair } from "@/lib/filters";

const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
};

const fairs: FilterableFair[] = [
  {
    id: "1",
    name: "Feira de Artesanato da Pajucara",
    description: "Artesanato e renda de bilro em Maceio",
    city: "Maceio",
    state: "AL",
    latitude: -9.6658,
    longitude: -35.7353,
    status: "PUBLISHED",
    categorySlugs: ["artesanato"],
    nextEventAt: future(3),
  },
  {
    id: "2",
    name: "Feira Gastronomica do Jaragua",
    description: "Comida de rua e frutos do mar",
    city: "Maceio",
    state: "AL",
    latitude: -9.6416,
    longitude: -35.7083,
    status: "PUBLISHED",
    categorySlugs: ["alimentos", "eventos-culturais"],
    nextEventAt: future(10),
  },
  {
    id: "3",
    name: "Feira de Penedo",
    description: "Cultura e cordel",
    city: "Penedo",
    state: "AL",
    latitude: -10.29,
    longitude: -36.5861,
    status: "PENDING_REVIEW",
    categorySlugs: ["eventos-culturais"],
    nextEventAt: null,
  },
  {
    id: "4",
    name: "Moda do Centro",
    description: "Brecho e moda autoral",
    city: "Maceio",
    state: "AL",
    latitude: null,
    longitude: null,
    status: "PUBLISHED",
    categorySlugs: ["moda"],
    nextEventAt: null,
  },
];

describe("filterFairs", () => {
  it("retorna apenas feirinhas publicadas por padrao", () => {
    const result = filterFairs(fairs, {});
    expect(result.map((f) => f.id)).toEqual(["1", "2", "4"]);
  });

  it("filtra por texto ignorando acentos e caixa", () => {
    const result = filterFairs(fairs, { query: "GASTRONOMICA" });
    expect(result.map((f) => f.id)).toEqual(["2"]);
  });

  it("filtra por cidade", () => {
    const result = filterFairs(fairs, { city: "maceio" });
    expect(result.map((f) => f.id)).toEqual(["1", "2", "4"]);
  });

  it("filtra por multiplas categorias (OU logico)", () => {
    const result = filterFairs(fairs, { categories: ["alimentos", "moda"] });
    expect(result.map((f) => f.id)).toEqual(["2", "4"]);
  });

  it("exclui feirinhas sem evento futuro quando filtra por data", () => {
    const result = filterFairs(fairs, { from: "2000-01-01" });
    expect(result.map((f) => f.id)).toEqual(["1", "2"]);
  });

  it("mantem apenas feirinhas com evento futuro quando onlyUpcoming", () => {
    const result = filterFairs(fairs, { onlyUpcoming: true });
    expect(result.every((f) => f.nextEventAt !== null)).toBe(true);
    expect(result.map((f) => f.id)).toEqual(["1", "2"]);
  });

  it("aplica filtro geografico por raio", () => {
    const result = filterFairs(fairs, { nearLat: -9.6658, nearLng: -35.7353, radiusKm: 10 });
    expect(result.map((f) => f.id)).toEqual(["1", "2"]);
  });

  it("permite consultar todos os status quando status = ALL", () => {
    const result = filterFairs(fairs, { status: "ALL" });
    expect(result).toHaveLength(4);
  });
});

describe("sortByNextEvent", () => {
  it("ordena por proxima ocorrencia e joga sem-evento para o fim", () => {
    const result = sortByNextEvent(fairs);
    expect(result[0].id).toBe("1");
    expect(result[result.length - 1].id).toBe("4");
  });
});

describe("helpers de agregacao", () => {
  it("conta feirinhas por categoria", () => {
    const counts = countByCategory(fairs);
    expect(counts.artesanato).toBe(1);
    expect(counts["eventos-culturais"]).toBe(2);
  });

  it("lista cidades unicas em ordem alfabetica", () => {
    expect(cityOptions(fairs)).toEqual(["Maceio", "Penedo"]);
  });
});