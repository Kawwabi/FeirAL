import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { listCategories, listPublishedFairs } from "@/lib/queries";
import { cityOptions, filterFairs, sortByNextEvent } from "@/lib/filters";
import { asArray, asBool, asString, type RawSearchParams } from "@/lib/search-params";
import { FilterForm } from "@/components/filter-form";
import { FairMap, type MapPoint } from "@/components/fair-map";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "Mapa interativo das feirinhas",
  description: "Veja no mapa todas as feirinhas de Alagoas e filtre por localizacao, data e categoria.",
};

export default async function MapaPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const [allFairs, categories] = await Promise.all([listPublishedFairs(), listCategories()]);

  const filters = {
    q: asString(params.q),
    category: asArray(params.category),
    city: asString(params.city),
    from: asString(params.from),
    to: asString(params.to),
    upcoming: asBool(params.upcoming) ? "1" : undefined,
  };

  const filtered = sortByNextEvent(
    filterFairs(allFairs, {
      query: filters.q,
      categories: filters.category,
      city: filters.city,
      from: filters.from,
      to: filters.to,
      onlyUpcoming: Boolean(filters.upcoming),
    }),
  );

  const colorBySlug = new Map(categories.map((c) => [c.slug, c.color ?? "#ea580c"]));

  const points: MapPoint[] = filtered
    .filter((f) => f.latitude != null && f.longitude != null)
    .map((f) => ({
      id: f.id,
      slug: f.slug,
      name: f.name,
      city: f.city,
      latitude: f.latitude as number,
      longitude: f.longitude as number,
      color: f.categorySlugs.length ? colorBySlug.get(f.categorySlugs[0]) : "#ea580c",
      rating: f.ratingCount > 0 ? f.ratingAverage : undefined,
    }));

  const withoutCoords = filtered.length - points.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Mapa"
        title="Feirinhas no mapa"
        description="Clique nos marcadores para ver os detalhes. Use os filtros para reduzir os resultados."
      />

      <FilterForm
        action="/mapa"
        categories={categories}
        cities={cityOptions(allFairs)}
        values={filters}
      />

      <div className="mt-6">
        {points.length === 0 ? (
          <div className="grid h-72 place-items-center rounded-2xl border border-dashed border-ink-300 bg-white text-sm text-ink-500">
            Nenhuma feirinha com coordenadas para os filtros selecionados.
          </div>
        ) : (
          <FairMap points={points} height="70vh" />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-500">
        <p>
          Exibindo <strong className="text-ink-800">{points.length}</strong> feirinha(s) no mapa em{" "}
          {new Set(filtered.map((f) => f.city)).size} cidade(s).
        </p>
        {withoutCoords > 0 ? (
          <p className="text-xs text-amber-700">
            {withoutCoords} feirinha(s) sem coordenadas cadastradas nao aparecem no mapa.
          </p>
        ) : null}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-ink-900">
          <MapPin size={18} /> Lista correspondente
        </h2>
        <div className="flex flex-wrap gap-2">
          {filtered.map((fair) => (
            <Link
              key={fair.id}
              href={`/feirinhas/${fair.slug}`}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700 hover:border-brand-300 hover:text-brand-700"
            >
              {fair.name} - {fair.city}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}