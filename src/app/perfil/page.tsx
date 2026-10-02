import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Star, MessageSquare, Bell, Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/forms";
import { Card, PageHeader, Badge, Stat, buttonClass } from "@/components/ui";
import { ROLE_LABELS } from "@/lib/constants";

export const metadata: Metadata = { title: "Meu perfil" };

export default async function ProfilePage() {
  const session = await requireUser();
  const user = await prisma.user.findUnique({ where: { id: session.id } });

  const [followCount, reviewCount, commentCount, unreadCount] = await Promise.all([
    prisma.follow.count({ where: { userId: session.id } }),
    prisma.review.count({ where: { authorId: session.id } }),
    prisma.comment.count({ where: { authorId: session.id } }),
    prisma.notification.count({ where: { userId: session.id, readAt: null } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minha conta"
        title={user?.name ?? "Meu perfil"}
        description="Gerencie seus dados, acompanhe feirinhas e personalize suas notificacoes."
        action={<Badge tone="brand">{ROLE_LABELS[session.role] ?? session.role}</Badge>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Acompanho" value={followCount} icon={<Heart size={16} />} tone="brand" />
        <Stat label="Avaliacoes" value={reviewCount} icon={<Star size={16} />} tone="warning" />
        <Stat label="Comentarios" value={commentCount} icon={<MessageSquare size={16} />} tone="info" />
        <Stat label="Nao lidas" value={unreadCount} icon={<Bell size={16} />} tone="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-base font-semibold text-ink-900">Dados do perfil</h2>
            <ProfileForm
              user={{
                name: user?.name ?? "",
                city: user?.city ?? null,
                bio: user?.bio ?? null,
                avatarUrl: user?.avatarUrl ?? null,
              }}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800">Acesso rapido</h3>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/perfil/favoritos" className={buttonClass("outline", "sm", "w-full")}>
                <Heart size={15} /> Feirinhas que acompanho
              </Link>
              <Link href="/perfil/avaliacoes" className={buttonClass("outline", "sm", "w-full")}>
                <Star size={15} /> Minhas avaliacoes
              </Link>
              <Link href="/perfil/notificacoes" className={buttonClass("outline", "sm", "w-full")}>
                <Bell size={15} /> Notificacoes
              </Link>
              <Link href="/perfil/preferencias" className={buttonClass("outline", "sm", "w-full")}>
                <Ticket size={15} /> Preferencias
              </Link>
            </div>
          </Card>

          {session.role === "VISITOR" ? (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-ink-800">Quer organizar feirinhas?</h3>
              <p className="mt-1 text-xs text-ink-500">
                Organizadores podem cadastrar feirinhas e criar anuncios patrocinados. Solicite a mudanca de
                perfil entrando em contato com a administracao.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}