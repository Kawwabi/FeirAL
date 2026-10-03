import type { Metadata } from "next";
import Link from "next/link";
import { Store, Calendar, Heart, Megaphone, Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { FairStatusBadge } from "@/components/status-badge";
import { Card, PageHeader, Stat, buttonClass } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Painel do organizador" };

export default async function OrganizerDashboard() {
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  const where = user.role === ROLES.ADMIN ? {} : { organizerId: user.id };

  const fairs = await prisma.fair.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { followers: true, events: true, reviews: true } },
      events: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 1 },
    },
  });

  const published = fairs.filter((f) => f.status === "PUBLISHED").length;
  const pending = fairs.filter((f) => f.status === "PENDING_REVIEW").length;
  const drafts = fairs.filter((f) => f.status === "DRAFT").length;
  const totalFollowers = fairs.reduce((acc, f) => acc + f._count.followers, 0);

  const adCount = await prisma.advertisement.count({
    where: user.role === ROLES.ADMIN ? {} : { ownerId: user.id, status: "ACTIVE" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title="Painel de controle"
        description="Gerencie suas feirinhas, acompanhe seguidores e crie anúncios patrocinados."
        action={
          <Link href="/organizador/feirinhas/nova" className={buttonClass("primary")}>
            <Plus size={16} /> Nova feirinha
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Feirinhas" value={fairs.length} hint={`${published} publicadas`} icon={<Store size={16} />} />
        <Stat label="Aguardando" value={pending} hint="em revisão" icon={<Calendar size={16} />} tone="warning" />
        <Stat label="Rascunhos" value={drafts} icon={<Pencil size={16} />} tone="neutral" />
        <Stat label="Seguidores" value={totalFollowers} icon={<Heart size={16} />} tone="danger" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-900">Anúncios ativos</h2>
          <Link href="/organizador/anuncios" className="text-sm font-medium text-brand-600 hover:underline">
            Gerenciar anúncios
          </Link>
        </div>
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-ink-600">
          <Megaphone size={15} className="text-brand-500" /> Você tem <strong>{adCount}</strong> anúncio(s) ativo(s).
        </p>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 p-5">
          <h2 className="text-base font-semibold text-ink-900">Feirinhas recentes</h2>
          <Link href="/organizador/feirinhas" className="text-sm font-medium text-brand-600 hover:underline">
            Ver todas
          </Link>
        </div>

        {fairs.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink-500">
            Você ainda não cadastrou feirinhas.{" "}
            <Link href="/organizador/feirinhas/nova" className="font-medium text-brand-600 hover:underline">
              Cadastrar agora
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {fairs.slice(0, 5).map((fair) => (
              <div key={fair.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link href={`/feirinhas/${fair.slug}`} className="font-medium text-ink-900 hover:text-brand-600">
                    {fair.name}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {fair.city} - {fair._count.followers} seguidores - {fair._count.events} eventos
                    {fair.events[0] ? ` - próximo: ${formatDateTime(fair.events[0].startsAt)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <FairStatusBadge status={fair.status} />
                  <Link href={`/organizador/feirinhas/${fair.id}/editar`} className={buttonClass("outline", "sm")}>
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}