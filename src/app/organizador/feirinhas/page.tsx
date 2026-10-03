import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Send, Trash2, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { deleteFairAction, submitFairForReviewAction } from "@/app/actions/fairs";
import { FairStatusBadge } from "@/components/status-badge";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Minhas feirinhas" };

export default async function OrganizerFairsPage() {
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  const fairs = await prisma.fair.findMany({
    where: user.role === ROLES.ADMIN ? {} : { organizerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { followers: true, events: true } }, categories: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title="Minhas feirinhas"
        description="Edite, envie para aprovação ou remova feirinhas cadastradas."
        action={
          <Link href="/organizador/feirinhas/nova" className={buttonClass("primary")}>
            <Plus size={16} /> Nova feirinha
          </Link>
        }
      />

      {fairs.length === 0 ? (
        <EmptyState
          title="Nenhuma feirinha cadastrada"
          description="Comece cadastrando sua primeira feirinha com detalhes, local e agenda."
          action={
            <Link href="/organizador/feirinhas/nova" className={buttonClass("primary")}>
              Cadastrar feirinha
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {fairs.map((fair) => (
            <Card key={fair.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-ink-900">{fair.name}</h2>
                    <FairStatusBadge status={fair.status} />
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {fair.city}/{fair.state} - {fair._count.events} eventos - {fair._count.followers} seguidores -
                    atualizada em {formatDateTime(fair.updatedAt)}
                  </p>
                  {fair.rejectionReason ? (
                    <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      Ajustes solicitados: {fair.rejectionReason}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/feirinhas/${fair.slug}`} className={buttonClass("ghost", "sm")}>
                    <ExternalLink size={14} /> Ver
                  </Link>
                  <Link href={`/organizador/feirinhas/${fair.id}/editar`} className={buttonClass("outline", "sm")}>
                    Editar
                  </Link>
                  {fair.status !== "PENDING_REVIEW" && fair.status !== "PUBLISHED" ? (
                    <form action={submitFairForReviewAction}>
                      <input type="hidden" name="fairId" value={fair.id} />
                      <button type="submit" className={buttonClass("success", "sm")}>
                        <Send size={14} /> Enviar para aprovação
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteFairAction}>
                    <input type="hidden" name="fairId" value={fair.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}