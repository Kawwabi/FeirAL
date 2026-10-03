import type { Metadata } from "next";
import Link from "next/link";
import { LayoutGrid, List, Store } from "lucide-react";
import { listCategories, listPublishedFairs } from "@/lib/queries";
import { filterFairs, sortByNextEvent, cityOptions } from "@/lib/filters";
import { asArray, asBool, asString, type RawSearchParams } from "@/lib/search-params";
import { FairCard, FairListItemRow } from "@/components/fair-card";
import { FilterForm } from "@/components/filter-form";
import { EmptyState, PageHeader, buttonClass } from "@/components/ui";

export const metadata: Metadata = {
  title: "Feirinhas de Alagoas",
  description: "Explore todas as feirinhas de Alagoas com filtros por localização, data e categoria.",
};

export default async function FairsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
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

  const cities = cityOptions(allFairs);
  const view = asString(params.view) === "list" ? "list" : "grid";

  const buildViewLink = (target: string) => {
    const query = new URLSearchParams();
    if (filters.q) query.set("q", filters.q);
    filters.category.forEach((c) => query.append("category", c));
    if (filters.city) query.set("city", filters.city);
    if (filters.from) query.set("from", filters.from);
    if (filters.to) query.set("to", filters.to);
    if (filters.upcoming) query.set("upcoming", filters.upcoming);
    if (target === "list") query.set("view", "list");
    const qs = query.toString();
    return `/feirinhas${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Explorar"
        title="Feirinhas de Alagoas"
        description="Filtre por localização, data e tipo de feira para encontrar o que combina com você."
        action={
          <Link href="/mapa" className={buttonClass("outline")}>
            <Store size={16} /> Ver no mapa
          </Link>
        }
      />

      <FilterForm
        action="/feirinhas"
        categories={categories}
        cities={cities}
        values={filters}
        hidden={view === "list" ? { view: "list" } : undefined}
      />

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-ink-500">
          <strong className="text-ink-800">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "feirinha encontrada" : "feirinhas encontradas"}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-ink-200 bg-white p-1">
          <Link
            href={buildViewLink("grid")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
              view === "grid" ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <LayoutGrid size={13} /> Grade
          </Link>
          <Link
            href={buildViewLink("list")}
            className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${
              view === "list" ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-100"
            }`}
          >
            <List size={13} /> Lista
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Store size={28} />}
            title="Nenhuma feirinha encontrada"
            description="Tente ajustar os filtros, remover a data ou escolher outra cidade."
            action={
              <Link href="/feirinhas" className={buttonClass("outline")}>
                Limpar filtros
              </Link>
            }
          />
        ) : view === "grid" ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((fair) => (
              <FairCard key={fair.id} fair={fair} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((fair) => (
              <div key={fair.id} className="card-surface p-4">
                <FairListItemRow fair={fair} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}