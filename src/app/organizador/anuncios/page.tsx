import type { Metadata } from "next";
import { Megaphone, Eye, MousePointerClick, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { AdForm } from "@/components/forms";
import { AdPlansCard, MyAdsList } from "@/components/ads-sections";
import { Card, PageHeader, Stat } from "@/components/ui";

export const metadata: Metadata = { title: "Anúncios patrocinados" };

export default async function OrganizerAdsPage() {
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  const ownerFilter = user.role === ROLES.ADMIN ? {} : { ownerId: user.id };

  const [ads, fairs] = await Promise.all([
    prisma.advertisement.findMany({
      where: ownerFilter,
      orderBy: { createdAt: "desc" },
      include: { fair: { select: { name: true } } },
    }),
    prisma.fair.findMany({
      where: user.role === ROLES.ADMIN ? {} : { organizerId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const impressions = ads.reduce((acc, ad) => acc + ad.impressions, 0);
  const clicks = ads.reduce((acc, ad) => acc + ad.clicks, 0);
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title="Anúncios patrocinados"
        description="Aumente a visibilidade das suas feirinhas com anúncios em destaque na plataforma."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Impressões" value={impressions.toLocaleString("pt-BR")} icon={<Eye size={16} />} tone="info" />
        <Stat label="Cliques" value={clicks.toLocaleString("pt-BR")} icon={<MousePointerClick size={16} />} tone="brand" />
        <Stat label="CTR" value={`${ctr}%`} hint="cliques por impressao" icon={<TrendingUp size={16} />} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 inline-flex items-center gap-2 text-base font-semibold text-ink-900">
            <Megaphone size={18} /> Criar novo anúncio
          </h2>
          {fairs.length === 0 ? (
            <p className="text-sm text-ink-500">Cadastre uma feirinha antes de criar anúncios patrocinados.</p>
          ) : (
            <AdForm fairs={fairs} />
          )}
        </Card>

        <div className="space-y-4">
          <AdPlansCard />
        </div>
      </div>

      <MyAdsList
        ads={ads.map((ad) => ({
          id: ad.id,
          title: ad.title,
          status: ad.status,
          tier: ad.tier,
          startsAt: ad.startsAt,
          endsAt: ad.endsAt,
          impressions: ad.impressions,
          clicks: ad.clicks,
          fairName: ad.fair.name,
        }))}
      />
    </div>
  );
}