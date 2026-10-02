import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Check, CheckCheck } from "lucide-react";
import { listNotifications } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { markAllNotificationsReadAction, markNotificationReadAction } from "@/app/actions/account";
import { formatDateTime, cn } from "@/lib/utils";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Notificacoes" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await listNotifications(user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minha conta"
        title="Notificacoes"
        description="Avisos sobre eventos, avaliacoes e moderacao."
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <button type="submit" className={buttonClass("outline", "sm")}>
                <CheckCheck size={15} /> Marcar todas como lidas
              </button>
            </form>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="Nenhuma notificacao"
          description="Quando houver novidades nas feirinhas que voce acompanha, aparecerao aqui."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn("flex flex-wrap items-start justify-between gap-3 p-4", !notification.readAt && "border-brand-200 bg-brand-50/40")}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-900">{notification.title}</p>
                  {!notification.readAt ? <Badge tone="brand">Nova</Badge> : null}
                </div>
                {notification.body ? <p className="mt-1 text-sm text-ink-600">{notification.body}</p> : null}
                <p className="mt-1 text-xs text-ink-400">{formatDateTime(notification.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {notification.link ? (
                  <Link href={notification.link} className={buttonClass("outline", "sm")}>
                    Abrir
                  </Link>
                ) : null}
                {!notification.readAt ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="notificationId" value={notification.id} />
                    <button type="submit" className={buttonClass("ghost", "sm")} aria-label="Marcar como lida">
                      <Check size={15} />
                    </button>
                  </form>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}