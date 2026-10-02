import type { Metadata } from "next";
import Link from "next/link";
import { Activity } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { asString, type RawSearchParams } from "@/lib/search-params";
import { Badge, Card, EmptyState, PageHeader, fieldClass } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Monitoramento de atividade" };

export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  await requireRole(ROLES.ADMIN);
  const params = await searchParams;
  const actionFilter = asString(params.action);

  const [logs, grouped] = await Promise.all([
    prisma.auditLog.findMany({
      where: actionFilter ? { action: actionFilter } : {},
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { name: true, email: true } } },
    }),
    prisma.auditLog.groupBy({ by: ["action"], _count: { _all: true }, orderBy: { _count: { action: "desc" } } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Monitoramento de atividade"
        description="Registro de auditoria das acoes realizadas na plataforma."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/atividade"
          className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
            !actionFilter ? "border-brand-400 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-600"
          }`}
        >
          Todas ({grouped.reduce((acc, g) => acc + g._count._all, 0)})
        </Link>
        {grouped.map((group) => (
          <Link
            key={group.action}
            href={`/admin/atividade?action=${encodeURIComponent(group.action)}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              actionFilter === group.action
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-ink-200 text-ink-600 hover:bg-ink-50"
            }`}
          >
            {group.action} ({group._count._all})
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 p-5">
          <Activity size={18} className="text-brand-600" />
          <h2 className="text-base font-semibold text-ink-900">Ultimos registros</h2>
        </div>

        {logs.length === 0 ? (
          <div className="p-6">
            <EmptyState title="Nenhum registro" description="Ainda nao ha atividade registrada." />
          </div>
        ) : (
          <div className="divide-y divide-ink-100">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="brand">{log.action}</Badge>
                    {log.entityType ? <span className="text-xs text-ink-500">{log.entityType}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {log.actor ? `${log.actor.name} (${log.actor.email})` : "Sistema"}
                    {log.entityId ? ` - ${log.entityId}` : ""}
                  </p>
                  {log.metadata ? (
                    <p className="mt-0.5 truncate text-xs text-ink-400">metadata: {log.metadata}</p>
                  ) : null}
                </div>
                <span className="whitespace-nowrap text-xs text-ink-400">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <form method="get" action="/admin/atividade" className="flex items-end gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ink-600">Filtrar por acao exata</span>
          <input name="action" defaultValue={actionFilter ?? ""} className={fieldClass} placeholder="Ex.: FAIR_APPROVED" />
        </label>
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
          Filtrar
        </button>
      </form>
    </div>
  );
}