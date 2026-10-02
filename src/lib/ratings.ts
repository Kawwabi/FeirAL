// Logica pura de agregacao de avaliacoes - coberta por testes em tests/ratings.test.ts

export interface RatingLike {
  rating: number;
  status?: string | null;
}

export interface RatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const EMPTY_DISTRIBUTION: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

/**
 * Calcula a media, a contagem e a distribuicao de notas.
 * Apenas avaliacoes com status PUBLISHED (ou sem status informado) sao consideradas.
 */
export function summarizeRatings(reviews: RatingLike[]): RatingSummary {
  const visible = reviews.filter((r) => !r.status || r.status === "PUBLISHED");
  const distribution = { ...EMPTY_DISTRIBUTION };

  let sum = 0;
  let count = 0;

  for (const review of visible) {
    const value = Math.round(review.rating);
    if (value < 1 || value > 5) continue;
    distribution[value as 1 | 2 | 3 | 4 | 5] += 1;
    sum += value;
    count += 1;
  }

  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;

  return { average, count, distribution };
}

/** Percentual (0-100) de cada nota em relacao ao total de avaliacoes visiveis. */
export function distributionPercentages(
  distribution: Record<1 | 2 | 3 | 4 | 5, number>,
): Record<1 | 2 | 3 | 4 | 5, number> {
  const total = Object.values(distribution).reduce((acc, n) => acc + n, 0);
  const result = { ...EMPTY_DISTRIBUTION };
  if (total === 0) return result;
  (Object.keys(distribution) as unknown as (keyof typeof distribution)[]).forEach((key) => {
    result[key] = Math.round((distribution[key] / total) * 100);
  });
  return result;
}

/** Media de uma lista simples de numeros, arredondada para 1 casa decimal. */
export function averageOf(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / values.length) * 10) / 10;
}