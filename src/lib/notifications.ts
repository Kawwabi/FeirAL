import "server-only";
import { prisma } from "./prisma";
import { NOTIFICATION_TYPES } from "./constants";

interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  body?: string;
  link?: string;
}

export async function createNotification(input: CreateNotificationInput) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    },
  });
}

/**
 * Notifica todos os seguidores de uma feirinha.
 * Respeita a preferência de notificação do usuário (por enquanto apenas a de novos eventos).
 */
export async function notifyFairFollowers(
  fairId: string,
  payload: { title: string; body?: string; link?: string; type?: string },
) {
  const followers = await prisma.follow.findMany({
    where: { fairId },
    select: { userId: true, user: { select: { notificationPref: true } } },
  });

  const eligible = followers.filter((f) => f.user.notificationPref?.newEvents !== false);
  if (eligible.length === 0) return 0;

  await prisma.notification.createMany({
    data: eligible.map((f) => ({
      userId: f.userId,
      type: payload.type ?? NOTIFICATION_TYPES.NEW_EVENT,
      title: payload.title,
      body: payload.body,
      link: payload.link,
    })),
  });

  return eligible.length;
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}