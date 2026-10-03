import type { Metadata } from "next";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES, ROLE_LABELS } from "@/lib/constants";
import { updateUserRoleAction } from "@/app/actions/admin";
import { Badge, Card, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Gestão de usuários" };

const ROLE_TONES: Record<string, "brand" | "neutral" | "info" | "danger"> = {
  VISITOR: "neutral",
  ORGANIZER: "info",
  ADMIN: "danger",
};

export default async function AdminUsersPage() {
  const admin = await requireRole(ROLES.ADMIN);

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { _count: { select: { fairs: true, reviews: true, comments: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        description="Gerencie papéis de acesso. Visitantes podem se tornar organizadores, e vice-versa."
      />

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-ink-100 p-5">
          <Users size={18} className="text-brand-500" />
          <h2 className="text-base font-semibold text-ink-900">{users.length} usuários</h2>
        </div>
        <div className="divide-y divide-ink-100">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink-900">{user.name}</p>
                  <Badge tone={ROLE_TONES[user.role] ?? "neutral"}>
                    {ROLE_LABELS[user.role] ?? user.role}
                  </Badge>
                </div>
                <p className="text-xs text-ink-500">
                  {user.email} - cadastrado em {formatDate(user.createdAt)}
                </p>
                <p className="text-xs text-ink-400">
                  {user._count.fairs} feirinhas - {user._count.reviews} avaliações - {user._count.comments} comentários
                </p>
              </div>

              <form action={updateUserRoleAction} className="flex items-center gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select
                  name="role"
                  defaultValue={user.role}
                  disabled={user.id === admin.id}
                  className="rounded-lg border border-ink-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  <option value="VISITOR">Visitante</option>
                  <option value="ORGANIZER">Organizador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button
                  type="submit"
                  disabled={user.id === admin.id}
                  className="rounded-lg bg-ink-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-ink-800 disabled:opacity-50"
                >
                  Atualizar
                </button>
              </form>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-ink-400">
        Observação: você não pode alterar o seu próprio papel de administrador enquanto estiver logado.
      </p>
    </div>
  );
}