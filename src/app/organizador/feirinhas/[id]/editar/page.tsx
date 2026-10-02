import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Send, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { updateFairAction, submitFairForReviewAction } from "@/app/actions/fairs";
import { FairForm } from "@/components/fair-form";
import { FairStatusBadge } from "@/components/status-badge";
import { Card, PageHeader, buttonClass } from "@/components/ui";
import { toIsoDateTimeInput } from "@/lib/utils";
import { asString, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Editar feirinha" };

export default async function EditFairPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const [fair, categories] = await Promise.all([
    prisma.fair.findUnique({
      where: { id },
      include: { categories: true, offerings: true, events: { orderBy: { startsAt: "asc" } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!fair) notFound();
  if (fair.organizerId !== user.id && user.role !== ROLES.ADMIN) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title={`Editar: ${fair.name}`}
        description="Atualize as informacoes, adicione eventos ou envie novamente para aprovacao."
        action={
          <div className="flex items-center gap-2">
            <FairStatusBadge status={fair.status} />
            <Link href={`/feirinhas/${fair.slug}`} className={buttonClass("ghost", "sm")}>
              <ExternalLink size={14} /> Ver pagina
            </Link>
          </div>
        }
      />

      {asString(query.criada) ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Feirinha cadastrada com sucesso!
        </p>
      ) : null}

      {fair.rejectionReason ? (
        <Card className="border-red-200 p-4">
          <p className="text-sm font-medium text-red-700">Ajustes solicitados pela moderacao</p>
          <p className="mt-1 text-sm text-red-600">{fair.rejectionReason}</p>
        </Card>
      ) : null}

      {fair.status === "PUBLISHED" || fair.status === "PENDING_REVIEW" ? null : (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-ink-600">
            Quando estiver pronto, envie a feirinha para aprovacao e ela ficara visivel publicamente.
          </p>
          <form action={submitFairForReviewAction}>
            <input type="hidden" name="fairId" value={fair.id} />
            <button type="submit" className={buttonClass("success", "sm")}>
              <Send size={14} /> Enviar para aprovacao
            </button>
          </form>
        </Card>
      )}

      <FairForm
        action={updateFairAction}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
        initial={{
          id: fair.id,
          name: fair.name,
          shortDescription: fair.shortDescription ?? "",
          description: fair.description,
          address: fair.address,
          city: fair.city,
          state: fair.state,
          zipCode: fair.zipCode ?? "",
          latitude: fair.latitude != null ? String(fair.latitude) : "",
          longitude: fair.longitude != null ? String(fair.longitude) : "",
          coverImageUrl: fair.coverImageUrl ?? "",
          contactEmail: fair.contactEmail ?? "",
          contactPhone: fair.contactPhone ?? "",
          websiteUrl: fair.websiteUrl ?? "",
          instagramUrl: fair.instagramUrl ?? "",
          categorySlugs: fair.categories.map((c) => c.slug),
          offerings: fair.offerings.map((o) => ({
            name: o.name,
            kind: o.kind,
            description: o.description ?? "",
            priceRange: o.priceRange ?? "",
          })),
          events: fair.events.map((e) => ({
            title: e.title,
            startsAt: toIsoDateTimeInput(e.startsAt),
            endsAt: e.endsAt ? toIsoDateTimeInput(e.endsAt) : "",
            address: e.address ?? "",
            notes: e.notes ?? "",
          })),
        }}
      />
    </div>
  );
}