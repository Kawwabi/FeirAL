import Link from "next/link";
import { SlidersHorizontal, Search } from "lucide-react";
import { fieldClass } from "@/components/ui";

export interface FilterValues {
  q?: string;
  category?: string[];
  city?: string;
  from?: string;
  to?: string;
  upcoming?: string;
}

export function FilterForm({
  action,
  categories,
  cities,
  values,
  hidden,
}: {
  action: string;
  categories: { slug: string; name: string; icon: string | null }[];
  cities: string[];
  values: FilterValues;
  hidden?: Record<string, string>;
}) {
  const selected = values.category ?? [];

  return (
    <form method="get" action={action} className="card-surface p-4 sm:p-5">
      {hidden
        ? Object.entries(hidden).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))
        : null}

      <div className="flex items-center gap-2 text-sm font-semibold text-ink-700">
        <SlidersHorizontal size={16} /> Filtrar feirinhas
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block lg:col-span-2">
          <span className="mb-1 block text-xs font-medium text-ink-600">Buscar por nome ou descricao</span>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              name="q"
              defaultValue={values.q ?? ""}
              placeholder="Ex.: artesanato, forro, culinaria..."
              className={`${fieldClass} pl-9`}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-600">Cidade</span>
          <select name="city" defaultValue={values.city ?? ""} className={fieldClass}>
            <option value="">Todas as cidades</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-2 lg:col-span-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-600">Data inicial</span>
            <input type="date" name="from" defaultValue={values.from ?? ""} className={fieldClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-ink-600">Data final</span>
            <input type="date" name="to" defaultValue={values.to ?? ""} className={fieldClass} />
          </label>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="mb-2 text-xs font-medium text-ink-600">Categorias</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label
              key={cat.slug}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 has-checked:border-brand-400 has-checked:bg-brand-50 has-checked:text-brand-700"
            >
              <input
                type="checkbox"
                name="category"
                value={cat.slug}
                defaultChecked={selected.includes(cat.slug)}
                className="h-3.5 w-3.5 rounded border-ink-300 text-brand-600"
              />
              {cat.icon ? `${cat.icon} ` : ""}
              {cat.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <label className="inline-flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            name="upcoming"
            value="1"
            defaultChecked={values.upcoming === "1"}
            className="h-4 w-4 rounded border-ink-300 text-brand-600"
          />
          Somente com evento futuro
        </label>

        <div className="flex items-center gap-2">
          <Link
            href={action}
            className="rounded-lg border border-ink-300 bg-white px-3 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
          >
            Limpar
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </form>
  );
}