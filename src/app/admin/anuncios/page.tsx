import type { Metadata } from "next";
import { Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AD_TIER_INFO, ROLES } from "@/lib/constants";
import { updateAdStatusAction } from "@/app/actions/ads";
import { AdStatusBadge } from "@/components/status-badge";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { formatBRL, formatDate } from "@/lib/utils";
import { AllAdsSection } from "@/components/admin-sections";

export const metadata: Metadata = { title: "Moderacao de anuncios" };

export default async function AdminAdsPage() {
  await requireRole(ROLES.ADMIN);

  const ads = await prisma.advertisement.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { fair: { select: { name: true, slug: true } }, owner: { select: { name: true, email: true } } },
  });

  const pending = ads.filter((ad) => ad.status === "PENDING");
  const rest = ads.filter((ad) => ad.status !== "PENDING");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administracao"
        title="Anuncios patrocinados"
        description="Revise e aprove anuncios antes de exibi-los na plataforma."
      />

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Aguardando aprovacao ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState title="Nenhum anuncio pendente" description="Nenhum anuncio aguardando revisao." />
        ) : (
          <div className="space-y-3">
            {pending.map((ad) => (
              <Card key={ad.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{ad.title}</h3>
                      <AdStatusBadge status={ad.status} />
                      <span className="text-xs text-ink-500">{AD_TIER_INFO[ad.tier]?.label ?? ad.tier}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {ad.fair.name} - {ad.owner.name} ({ad.owner.email}) - {formatBRL(ad.dailyBudgetCents)}/dia
                    </p>
                    <p className="text-xs text-ink-400">
                      {formatDate(ad.startsAt)} a {formatDate(ad.endsAt)}
                    </p>
                    {ad.description ? <p className="mt-2 text-sm text-ink-600">{ad.description}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updateAdStatusAction}>
                      <input type="hidden" name="adId" value={ad.id} />
                      <input type="hidden" name="status" value="ACTIVE" />
                      <button type="submit" className={buttonClass("success", "sm")}>
                        <Check size={14} /> Aprovar
                      </button>
                    </form>
                    <form action={updateAdStatusAction}>
                      <input type="hidden" name="adId" value={ad.id} />
                      <input type="hidden" name="status" value="REJECTED" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <X size={14} /> Rejeitar
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AllAdsSection ads={rest} />
    </div>
  );
}