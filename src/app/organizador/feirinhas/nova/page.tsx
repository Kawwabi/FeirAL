import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { createFairAction } from "@/app/actions/fairs";
import { FairForm } from "@/components/fair-form";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Nova feirinha" };

export default async function NewFairPage() {
  await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title="Cadastrar nova feirinha"
        description="Preencha os detalhes, o local e a agenda. Salve como rascunho ou envie para aprovação."
      />
      <FairForm
        action={createFairAction}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
      />
    </div>
  );
}