import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Download } from "lucide-react";
import { listCategories, listUpcomingEvents, type AgendaEvent } from "@/lib/queries";
import { groupEventsByDay } from "@/lib/calendar";
import { asArray, asString, type RawSearchParams } from "@/lib/search-params";
import { EmptyState, PageHeader, buttonClass, fieldClass } from "@/components/ui";
import { AgendaList } from "@/components/agenda-list";

export const metadata: Metadata = {
  title: "Agenda de eventos",
  description: "Agenda com todos os eventos futuros das feirinhas de Alagoas. Adicione ao Google Agenda.",
};

function filterEvents(
  events: AgendaEvent[],
  opts: { city?: string; from?: string; to?: string; categories: string[] },
) {
  const fromTs = opts.from ? new Date(`${opts.from}T00:00:00`).getTime() : undefined;
  const toTs = opts.to ? new Date(`${opts.to}T23:59:59`).getTime() : undefined;

  return events.filter((event) => {
    if (opts.city && event.city !== opts.city) return false;
    if (opts.categories.length && !event.categorySlugs.some((c) => opts.categories.includes(c))) return false;
    const ts = new Date(event.startsAt).getTime();
    if (fromTs !== undefined && ts < fromTs) return false;
    if (toTs !== undefined && ts > toTs) return false;
    return true;
  });
}

export default async function AgendaPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const [events, categories] = await Promise.all([listUpcomingEvents(200), listCategories()]);

  const city = asString(params.city);
  const from = asString(params.from);
  const to = asString(params.to);
  const selectedCats = asArray(params.category);

  const filtered = filterEvents(events, { city, from, to, categories: selectedCats });
  const grouped = groupEventsByDay(filtered);
  const cities = Array.from(new Set(events.map((e) => e.city))).sort((a, b) => a.localeCompare(b, "pt-BR"));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Agenda"
        title="Agenda de eventos"
        description="Todos os eventos futuros das feirinhas de Alagoas. Adicione ao Google Agenda com um clique."
        action={
          <Link href="/api/agenda/ics" className={buttonClass("outline")} download>
            <Download size={16} /> Assinar agenda (.ics)
          </Link>
        }
      />

      <form method="get" action="/agenda" className="card-surface p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-600">Cidade</span>
            <select name="city" defaultValue={city ?? ""} className={fieldClass}>
              <option value="">Todas</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-600">De</span>
            <input type="date" name="from" defaultValue={from ?? ""} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-600">Ate</span>
            <input type="date" name="to" defaultValue={to ?? ""} className={fieldClass} />
          </label>
          <div className="flex items-end gap-2">
            <button type="submit" className={buttonClass("primary", "sm", "flex-1")}>
              Filtrar
            </button>
            <Link href="/agenda" className={buttonClass("outline", "sm")}>
              Limpar
            </Link>
          </div>
        </div>

        <fieldset className="mt-3">
          <legend className="mb-2 text-xs font-medium text-ink-600">Categorias</legend>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <label
                key={cat.slug}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 has-checked:border-brand-400 has-checked:bg-brand-50"
              >
                <input
                  type="checkbox"
                  name="category"
                  value={cat.slug}
                  defaultChecked={selectedCats.includes(cat.slug)}
                  className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600"
                />
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      <p className="mt-4 text-sm text-ink-500">
        <strong className="text-ink-800">{filtered.length}</strong> evento(s) encontrado(s).
      </p>

      <div className="mt-6">
        {grouped.length === 0 ? (
          <EmptyState
            icon={<Calendar size={28} />}
            title="Nenhum evento para os filtros selecionados"
            description="Ajuste o periodo ou a cidade para ver mais resultados."
          />
        ) : (
          <AgendaList grouped={grouped} />
        )}
      </div>
    </div>
  );
}