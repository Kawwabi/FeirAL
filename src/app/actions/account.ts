"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { profileSchema, preferencesSchema } from "@/lib/validation";
import { fieldErrors, type ActionState } from "@/lib/action-state";
import { logAudit } from "@/lib/audit";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/notifications";

export async function toggleFollowAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const slug = String(formData.get("slug") ?? "");

  let user;
  try {
    user = await requireUser();
  } catch {
    return;
  }

  const existing = await prisma.follow.findUnique({
    where: { userId_fairId: { userId: user.id, fairId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
  } else {
    await prisma.follow.create({ data: { userId: user.id, fairId } });
    await logAudit({ actorId: user.id, action: "FAIR_FOLLOWED", entityType: "Fair", entityId: fairId });
  }

  if (slug) revalidatePath(`/feirinhas/${slug}`);
  revalidatePath("/perfil/favoritos");
}

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("notificationId") ?? "");
  await markNotificationRead(user.id, id);
  revalidatePath("/perfil/notificacoes");
  revalidatePath("/");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/perfil/notificacoes");
  revalidatePath("/");
}

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Faça login novamente." };
  }

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city") || undefined,
    bio: formData.get("bio") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados.", errors: fieldErrors(parsed.error.issues) };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      city: parsed.data.city ?? null,
      bio: parsed.data.bio ?? null,
      avatarUrl: parsed.data.avatarUrl ?? null,
    },
  });

  await logAudit({ actorId: user.id, action: "PROFILE_UPDATED", entityType: "User", entityId: user.id });
  revalidatePath("/perfil");
  return { ok: true, message: "Perfil atualizado com sucesso." };
}

export async function updatePreferencesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Faça login novamente." };
  }

  const parsed = preferencesSchema.safeParse({
    emailEnabled: formData.get("emailEnabled") === "on",
    pushEnabled: formData.get("pushEnabled") === "on",
    newEvents: formData.get("newEvents") === "on",
    reviewReplies: formData.get("reviewReplies") === "on",
    weeklyDigest: formData.get("weeklyDigest") === "on",
    preferredCity: formData.get("preferredCity") || undefined,
    preferredCategories: formData.getAll("preferredCategories").map(String).filter(Boolean).join(","),
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira as preferências.", errors: fieldErrors(parsed.error.issues) };
  }

  const data = parsed.data;
  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
      newEvents: data.newEvents,
      reviewReplies: data.reviewReplies,
      weeklyDigest: data.weeklyDigest,
      preferredCity: data.preferredCity ?? null,
      preferredCategories: Array.isArray(data.preferredCategories)
        ? data.preferredCategories.join(",")
        : (data.preferredCategories ?? ""),
    },
    update: {
      emailEnabled: data.emailEnabled,
      pushEnabled: data.pushEnabled,
      newEvents: data.newEvents,
      reviewReplies: data.reviewReplies,
      weeklyDigest: data.weeklyDigest,
      preferredCity: data.preferredCity ?? null,
      preferredCategories: Array.isArray(data.preferredCategories)
        ? data.preferredCategories.join(",")
        : (data.preferredCategories ?? ""),
    },
  });

  await logAudit({ actorId: user.id, action: "PREFERENCES_UPDATED", entityType: "User", entityId: user.id });
  revalidatePath("/perfil/preferencias");
  return { ok: true, message: "Preferências de notificação salvas." };
}
