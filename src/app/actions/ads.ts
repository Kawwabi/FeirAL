"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, AuthError } from "@/lib/auth";
import { adSchema } from "@/lib/validation";
import { fieldErrors, type ActionState } from "@/lib/action-state";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { AD_TIER_INFO, NOTIFICATION_TYPES, ROLES } from "@/lib/constants";

export async function createAdAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Entre para criar um anuncio." };
  }

  const parsed = adSchema.safeParse({
    fairId: formData.get("fairId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    tier: formData.get("tier") ?? "BASIC",
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados do anuncio.", errors: fieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;
  const fair = await prisma.fair.findUnique({
    where: { id: data.fairId },
    select: { organizerId: true, name: true },
  });

  if (!fair) return { ok: false, message: "Feirinha nao encontrada." };
  if (fair.organizerId !== user.id && user.role !== ROLES.ADMIN) {
    return { ok: false, message: "Voce so pode anunciar suas proprias feirinhas." };
  }

  const tierInfo = AD_TIER_INFO[data.tier] ?? AD_TIER_INFO.BASIC;

  const ad = await prisma.advertisement.create({
    data: {
      fairId: data.fairId,
      ownerId: user.id,
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      tier: data.tier,
      status: "PENDING",
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      dailyBudgetCents: tierInfo.priceCents,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: ROLES.ADMIN }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: NOTIFICATION_TYPES.AD_UPDATE,
        title: "Novo anuncio patrocinado aguardando aprovacao",
        body: `${fair.name} - plano ${tierInfo.label}`,
        link: "/admin/anuncios",
      }),
    ),
  );

  await logAudit({
    actorId: user.id,
    action: "AD_CREATED",
    entityType: "Advertisement",
    entityId: ad.id,
    metadata: { tier: data.tier },
  });

  revalidatePath("/organizador/anuncios");
  return {
    ok: true,
    message: `Anuncio enviado! Plano ${tierInfo.label} (${tierInfo.impressionsPerDay.toLocaleString("pt-BR")} impressoes/dia).`,
  };
}

export async function updateAdStatusAction(formData: FormData): Promise<void> {
  const adId = String(formData.get("adId") ?? "");
  const status = String(formData.get("status") ?? "");
  const user = await requireRole(ROLES.ADMIN, ROLES.ORGANIZER);

  const ad = await prisma.advertisement.findUnique({
    where: { id: adId },
    select: { ownerId: true },
  });
  if (!ad) return;
  if (user.role !== ROLES.ADMIN && ad.ownerId !== user.id) return;

  const allowed = ["PENDING", "ACTIVE", "PAUSED", "EXPIRED", "REJECTED"];
  if (!allowed.includes(status)) return;

  await prisma.advertisement.update({ where: { id: adId }, data: { status } });
  await logAudit({
    actorId: user.id,
    action: "AD_STATUS_CHANGED",
    entityType: "Advertisement",
    entityId: adId,
    metadata: { status },
  });
  revalidatePath("/organizador/anuncios");
  revalidatePath("/admin/anuncios");
  revalidatePath("/");
}
