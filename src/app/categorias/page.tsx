import type { Metadata } from "next";
import Link from "next/link";
import { listCategories, listPublishedFairs } from "@/lib/queries";
import { countByCategory } from "@/lib/filters";
import { PageHeader, Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Categorias de feirinhas",
  description: "Navegue pelas categorias de feirinhas: artesanato, alimentos, moda, eventos culturais e mais.",
};

export default async function CategoriesPage() {
  const [categories, fairs] = await Promise.all([listCategories(), listPublishedFairs()]);
  const counts = countByCategory(fairs);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Categorias"
        title="Explore por categoria"
        description="Escolha o tipo de feira que combina com o seu interesse."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link key={cat.slug} href={`/categorias/${cat.slug}`}>
            <Card className="h-full p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl text-2xl"
                  style={{ backgroundColor: `${cat.color ?? "#FF7001"}22` }}
                >
                  {cat.icon ?? "🛍️"}
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">{cat.name}</h2>
                  <p className="text-xs text-ink-500">{counts[cat.slug] ?? 0} feirinha(s)</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink-500">{cat.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}