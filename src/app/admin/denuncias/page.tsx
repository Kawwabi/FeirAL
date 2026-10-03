import type { Metadata } from "next";
import { Flag, Eye, CheckCircle2, Archive } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { resolveReportAction } from "@/app/actions/admin";
import { hideContentAction } from "@/app/actions/community";
import { ReportStatusBadge } from "@/components/status-badge";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Fila de moderação" };

export default async function AdminReportsPage() {
  await requireRole(ROLES.ADMIN);

  const reports = await prisma.moderationReport.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { reporter: { select: { name: true, email: true } }, handledBy: { select: { name: true } } },
  });

  const open = reports.filter((r) => r.status === "OPEN");
  const closed = reports.filter((r) => r.status !== "OPEN");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administração"
        title="Denúncias e moderação"
        description="Analise as denúncias dos usuários, oculte conteúdos inadequados e registre a resolução."
      />

      <section>
        <h2 className="mb-3 inline-flex items-center gap-2 text-base font-semibold text-ink-900">
          <Flag size={16} className="text-red-600" /> Abertas ({open.length})
        </h2>
        {open.length === 0 ? (
          <EmptyState title="Nenhuma denúncia aberta" description="A comunidade está tranquila por aqui." />
        ) : (
          <div className="space-y-3">
            {open.map((report) => (
              <Card key={report.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="danger">{report.targetType}</Badge>
                      <span className="text-sm font-semibold text-ink-900">{report.reason}</span>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      Denunciado por {report.reporter.name} ({report.reporter.email}) em{" "}
                      {formatDateTime(report.createdAt)}
                    </p>
                    {report.details ? (
                      <p className="mt-2 rounded-lg bg-ink-50 p-2 text-sm text-ink-600">{report.details}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-ink-400">
                      ID do conteúdo: {report.targetId}
                    </p>
                  </div>

                  <div className="w-full max-w-xs space-y-2">
                    {["REVIEW", "COMMENT", "FEEDBACK"].includes(report.targetType) ? (
                      <form action={hideContentAction}>
                        <input type="hidden" name="type" value={report.targetType} />
                        <input type="hidden" name="id" value={report.targetId} />
                        <button type="submit" className={buttonClass("outline", "sm", "w-full")}>
                          <Eye size={14} /> Ocultar conteúdo
                        </button>
                      </form>
                    ) : null}

                    <form action={resolveReportAction} className="space-y-2">
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="status" value="RESOLVED" />
                      <input
                        name="note"
                        placeholder="Observação da resolução (opcional)"
                        className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm"
                      />
                      <div className="flex gap-2">
                        <button type="submit" className={buttonClass("success", "sm", "flex-1")}>
                          <CheckCircle2 size={14} /> Resolver
                        </button>
                      </div>
                    </form>

                    <form action={resolveReportAction}>
                      <input type="hidden" name="reportId" value={report.id} />
                      <input type="hidden" name="status" value="DISMISSED" />
                      <button type="submit" className={buttonClass("ghost", "sm", "w-full")}>
                        <Archive size={14} /> Arquivar
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Histórico ({closed.length})</h2>
        <Card className="overflow-hidden">
          {closed.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">Sem histórico.</p>
          ) : (
            <div className="divide-y divide-ink-100">
              {closed.map((report) => (
                <div key={report.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm text-ink-800">
                      <Badge tone="neutral">{report.targetType}</Badge> {report.reason}
                    </p>
                    <p className="text-xs text-ink-400">
                      Resolvido por {report.handledBy?.name ?? "-"}
                      {report.resolutionNote ? ` - ${report.resolutionNote}` : ""}
                    </p>
                  </div>
                  <ReportStatusBadge status={report.status} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}