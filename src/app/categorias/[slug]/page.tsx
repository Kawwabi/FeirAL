import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Store } from "lucide-react";
import { listCategories, listFairsByCategory } from "@/lib/queries";
import { sortByNextEvent } from "@/lib/filters";
import { FairCard } from "@/components/fair-card";
import { EmptyState, PageHeader, buttonClass } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Categoria" };
  return {
    title: `Feirinhas de ${category.name} em Alagoas`,
    description: category.description ?? `Feirinhas de ${category.name} em Alagoas.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const fairs = sortByNextEvent(await listFairsByCategory(slug));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Categoria"
        title={`${category.icon ?? ""} ${category.name}`.trim()}
        description={category.description ?? undefined}
        action={
          <Link href="/categorias" className={buttonClass("outline")}>
            Todas as categorias
          </Link>
        }
      />

      {fairs.length === 0 ? (
        <EmptyState
          icon={<Store size={28} />}
          title="Nenhuma feirinha nesta categoria ainda"
          description="Volte em breve ou explore outras categorias."
          action={
            <Link href="/feirinhas" className={buttonClass("outline")}>
              Ver todas as feirinhas
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {fairs.map((fair) => (
            <FairCard key={fair.id} fair={fair} />
          ))}
        </div>
      )}
    </div>
  );
}