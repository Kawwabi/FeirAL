import type { Metadata } from "next";
import Link from "next/link";
import { Check, X, Star, Trash2, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import {
  adminApproveFairAction,
  adminRejectFairAction,
  adminToggleFeaturedAction,
  deleteFairAction,
} from "@/app/actions/fairs";
import { FairStatusBadge } from "@/components/status-badge";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Feirinhas e moderacao" };

const REJECT_REASONS = [
  "Informacoes incompletas",
  "Localizacao incorreta ou ausente",
  "Descricao inadequada",
  "Conteudo duplicado",
  "Imagem inadequada",
];

export default async function AdminFairsPage() {
  await requireRole(ROLES.ADMIN);

  const [pending, others] = await Promise.all([
    prisma.fair.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { updatedAt: "asc" },
      include: { organizer: { select: { name: true, email: true } }, categories: true },
    }),
    prisma.fair.findMany({
      where: { status: { not: "PENDING_REVIEW" } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: { organizer: { select: { name: true } }, _count: { select: { followers: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Administracao"
        title="Feirinhas e moderacao"
        description="Aprove, rejeite ou destaque feirinhas cadastradas pelos organizadores."
      />

      <section>
        <h2 className="mb-3 text-base font-semibold text-ink-900">Aguardando revisao ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState title="Nenhuma feirinha pendente" description="Tudo em dia por aqui." />
        ) : (
          <div className="space-y-3">
            {pending.map((fair) => (
              <Card key={fair.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-ink-900">{fair.name}</h3>
                      <FairStatusBadge status={fair.status} />
                    </div>
                    <p className="mt-1 text-xs text-ink-500">
                      {fair.city}/{fair.state} - por {fair.organizer.name} ({fair.organizer.email}) -{" "}
                      {formatDateTime(fair.updatedAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-ink-600">{fair.description}</p>
                    <Link
                      href={`/feirinhas/${fair.slug}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:underline"
                    >
                      <ExternalLink size={12} /> Ver pre-visualizacao
                    </Link>
                  </div>

                  <div className="w-full max-w-xs space-y-2">
                    <form action={adminApproveFairAction}>
                      <input type="hidden" name="fairId" value={fair.id} />
                      <button type="submit" className={buttonClass("success", "sm", "w-full")}>
                        <Check size={14} /> Aprovar e publicar
                      </button>
                    </form>
                    <form action={adminRejectFairAction} className="space-y-2">
                      <input type="hidden" name="fairId" value={fair.id} />
                      <select name="reason" className="w-full rounded-lg border border-ink-300 px-3 py-2 text-sm">
                        {REJECT_REASONS.map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <X size={14} /> Rejeitar com ajustes
                      </button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <AllFairsSection others={others} />
    </div>
  );
}

interface OtherFair {
  id: string;
  slug: string;
  name: string;
  status: string;
  isFeatured: boolean;
  city: string;
  organizer: { name: string };
  _count: { followers: number };
}

function AllFairsSection({ others }: { others: OtherFair[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-ink-900">Todas as feirinhas</h2>
      <Card className="overflow-hidden">
        <div className="divide-y divide-ink-100">
          {others.map((fair) => (
            <div key={fair.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/feirinhas/${fair.slug}`}
                    className="font-medium text-ink-900 hover:text-brand-700"
                  >
                    {fair.name}
                  </Link>
                  <FairStatusBadge status={fair.status} />
                  {fair.isFeatured ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                      <Star size={11} fill="currentColor" /> destaque
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-ink-500">
                  {fair.city} - {fair.organizer.name} - {fair._count.followers} seguidores
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={adminToggleFeaturedAction}>
                  <input type="hidden" name="fairId" value={fair.id} />
                  <button type="submit" className={buttonClass("outline", "sm")}>
                    <Star size={14} /> {fair.isFeatured ? "Remover destaque" : "Destacar"}
                  </button>
                </form>
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
          ))}
        </div>
      </Card>
    </section>
  );
}