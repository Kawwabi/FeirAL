import type { Metadata } from "next";
import Link from "next/link";
import { Users, Store, Flag, Star, MessageSquare, Megaphone, Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { Badge, Card, PageHeader, Stat } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Visao geral administrativa" };

export default async function AdminDashboard() {
  await requireRole(ROLES.ADMIN);

  const [
    users,
    organizers,
    fairs,
    published,
    pendingReview,
    reviews,
    comments,
    openReports,
    activeAds,
    totalImpressions,
    recentLogs,
    byCity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.fair.count(),
    prisma.fair.count({ where: { status: "PUBLISHED" } }),
    prisma.fair.count({ where: { status: "PENDING_REVIEW" } }),
    prisma.review.count(),
    prisma.comment.count(),
    prisma.moderationReport.count({ where: { status: "OPEN" } }),
    prisma.advertisement.count({ where: { status: "ACTIVE" } }),
    prisma.advertisement.aggregate({ _sum: { impressions: true, clicks: true } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true } } },
    }),
    prisma.fair.groupBy({ by: ["city"], _count: { _all: true }, orderBy: { _count: { city: "desc" } }, take: 6 }),
  ]);

  const impressions = totalImpressions._sum.impressions ?? 0;
  const clicks = totalImpressions._sum.clicks ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Visao geral da plataforma"
        description="Monitore a atividade, gerencie conteudos e acompanhe a moderacao."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Usuarios" value={users} hint={`${organizers} organizadores`} icon={<Users size={16} />} />
        <Stat
          label="Feirinhas"
          value={fairs}
          hint={`${published} publicadas`}
          icon={<Store size={16} />}
          tone="success"
        />
        <Stat
          label="Aguardando revisao"
          value={pendingReview}
          icon={<Activity size={16} />}
          tone={pendingReview > 0 ? "warning" : "neutral"}
        />
        <Stat
          label="Denuncias abertas"
          value={openReports}
          icon={<Flag size={16} />}
          tone={openReports > 0 ? "danger" : "neutral"}
        />
        <Stat label="Avaliacoes" value={reviews} icon={<Star size={16} />} tone="warning" />
        <Stat label="Comentarios" value={comments} icon={<MessageSquare size={16} />} tone="info" />
        <Stat label="Anuncios ativos" value={activeAds} icon={<Megaphone size={16} />} tone="brand" />
        <Stat
          label="Impressoes de anuncios"
          value={impressions.toLocaleString("pt-BR")}
          hint={`${clicks.toLocaleString("pt-BR")} cliques`}
          icon={<Megaphone size={16} />}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">Atividade recente</h2>
            <Link href="/admin/atividade" className="text-sm font-medium text-brand-700 hover:underline">
              Ver tudo
            </Link>
          </div>
          <div className="mt-3 divide-y divide-ink-100">
            {recentLogs.length === 0 ? (
              <p className="py-4 text-sm text-ink-500">Nenhuma atividade registrada ainda.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm text-ink-800">
                      <Badge tone="neutral">{log.action}</Badge>{" "}
                      <span className="text-ink-500">{log.actor?.name ?? "Sistema"}</span>
                    </p>
                    {log.entityType ? (
                      <p className="text-xs text-ink-400">
                        {log.entityType}
                        {log.entityId ? ` - ${log.entityId.slice(0, 8)}...` : ""}
                      </p>
                    ) : null}
                  </div>
                  <span className="whitespace-nowrap text-xs text-ink-400">{formatDateTime(log.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink-900">Feirinhas por cidade</h2>
          <div className="mt-3 space-y-2">
            {byCity.length === 0 ? (
              <p className="text-sm text-ink-500">Sem dados.</p>
            ) : (
              byCity.map((row) => (
                <div key={row.city} className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{row.city}</span>
                  <span className="font-semibold text-ink-900">{row._count._all}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}