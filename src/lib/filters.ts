import { haversineKm } from "./utils";

// Logica pura de filtragem de feirinhas - coberta por testes em tests/filters.test.ts

export interface FilterableFair {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  categorySlugs: string[];
  /** Data da proxima ocorrencia (ISO) - pode ser null quando nao ha eventos futuros. */
  nextEventAt?: string | null;
}

export interface FairFilters {
  query?: string;
  categories?: string[];
  city?: string;
  /** Data inicial (ISO yyyy-MM-dd) - inclusiva. */
  from?: string;
  /** Data final (ISO yyyy-MM-dd) - inclusiva. */
  to?: string;
  /** Somente feirinhas com pelo menos um evento futuro. */
  onlyUpcoming?: boolean;
  /** Filtro geografico: centro + raio em km. */
  nearLat?: number;
  nearLng?: number;
  radiusKm?: number;
  status?: string;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function dayStartIso(value: string): number {
  const d = new Date(`${value}T00:00:00`);
  return d.getTime();
}

function dayEndIso(value: string): number {
  const d = new Date(`${value}T23:59:59.999`);
  return d.getTime();
}

/**
 * Aplica os filtros da plataforma sobre uma lista de feirinhas.
 * Regras:
 *  - query: casa em nome ou descricao (sem acento, case-insensitive).
 *  - categories: OR entre slugs selecionados.
 *  - city: igualdade normalizada.
 *  - from/to: a proxima ocorrencia deve cair dentro do intervalo.
 *  - nearLat/nearLng/radiusKm: distancia maxima em km.
 */
export function filterFairs<T extends FilterableFair>(fairs: T[], filters: FairFilters): T[] {
  const status = filters.status ?? "PUBLISHED";
  const query = filters.query ? normalize(filters.query) : "";
  const city = filters.city ? normalize(filters.city) : "";
  const categories = filters.categories ?? [];
  const fromTs = filters.from ? dayStartIso(filters.from) : undefined;
  const toTs = filters.to ? dayEndIso(filters.to) : undefined;

  return fairs.filter((fair) => {
    if (status !== "ALL" && fair.status !== status) return false;

    if (query) {
      const haystack = `${normalize(fair.name)} ${normalize(fair.description)}`;
      if (!haystack.includes(query)) return false;
    }

    if (city && normalize(fair.city) !== city) return false;

    if (categories.length > 0) {
      const hasCategory = categories.some((slug) => fair.categorySlugs.includes(slug));
      if (!hasCategory) return false;
    }

    if (fromTs !== undefined || toTs !== undefined) {
      if (!fair.nextEventAt) return false;
      const ts = new Date(fair.nextEventAt).getTime();
      if (fromTs !== undefined && ts < fromTs) return false;
      if (toTs !== undefined && ts > toTs) return false;
    }

    if (filters.onlyUpcoming) {
      if (!fair.nextEventAt) return false;
      if (new Date(fair.nextEventAt).getTime() < Date.now()) return false;
    }

    if (
      filters.nearLat !== undefined &&
      filters.nearLng !== undefined &&
      filters.radiusKm !== undefined
    ) {
      if (fair.latitude == null || fair.longitude == null) return false;
      const distance = haversineKm(filters.nearLat, filters.nearLng, fair.latitude, fair.longitude);
      if (distance > filters.radiusKm) return false;
    }

    return true;
  });
}

/** Ordena por proxima ocorrencia; feirinhas sem evento futuro vao para o final. */
export function sortByNextEvent<T extends FilterableFair>(fairs: T[]): T[] {
  return [...fairs].sort((a, b) => {
    const aTs = a.nextEventAt ? new Date(a.nextEventAt).getTime() : Number.POSITIVE_INFINITY;
    const bTs = b.nextEventAt ? new Date(b.nextEventAt).getTime() : Number.POSITIVE_INFINITY;
    if (aTs === bTs) return a.name.localeCompare(b.name, "pt-BR");
    return aTs - bTs;
  });
}

export function countByCategory(fairs: FilterableFair[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const fair of fairs) {
    for (const slug of fair.categorySlugs) {
      counts[slug] = (counts[slug] ?? 0) + 1;
    }
  }
  return counts;
}

export function cityOptions(fairs: FilterableFair[]): string[] {
  return Array.from(new Set(fairs.map((f) => f.city).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}