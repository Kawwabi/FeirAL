"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole, canManageFair, AuthError } from "@/lib/auth";
import { fairSchema } from "@/lib/validation";
import { fieldErrors, type ActionState } from "@/lib/action-state";
import { slugify } from "@/lib/utils";
import { logAudit } from "@/lib/audit";
import { notifyFairFollowers, createNotification } from "@/lib/notifications";
import { FAIR_STATUS, ROLES, NOTIFICATION_TYPES } from "@/lib/constants";

function parseJsonArray(value: FormDataEntryValue | null): unknown[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readFairForm(formData: FormData) {
  return fairSchema.safeParse({
    name: formData.get("name"),
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description"),
    address: formData.get("address"),
    city: formData.get("city"),
    state: formData.get("state") || "AL",
    zipCode: formData.get("zipCode") || undefined,
    latitude: formData.get("latitude"),
    longitude: formData.get("longitude"),
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    contactEmail: formData.get("contactEmail") || undefined,
    contactPhone: formData.get("contactPhone") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    categories: parseJsonArray(formData.get("categories")),
    offerings: parseJsonArray(formData.get("offerings")),
    events: parseJsonArray(formData.get("events")),
  });
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name) || "feirinha";
  let candidate = base;
  let suffix = 1;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const existing = await prisma.fair.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return `${base}-${Date.now()}`;
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createFairAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof AuthError ? error.message : "Faça login como organizador.",
    };
  }

  const parsed = readFairForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Verifique os campos destacados.",
      errors: fieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const submit = formData.get("intent") === "submit";
  const slug = await uniqueSlug(data.name);

  const fair = await prisma.fair.create({
    data: {
      slug,
      name: data.name,
      shortDescription: data.shortDescription,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      latitude: data.latitude,
      longitude: data.longitude,
      coverImageUrl: data.coverImageUrl,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      websiteUrl: data.websiteUrl,
      instagramUrl: data.instagramUrl,
      status: submit ? FAIR_STATUS.PENDING_REVIEW : FAIR_STATUS.DRAFT,
      organizerId: user.id,
      categories: { connect: data.categories.map((slug) => ({ slug })) },
      offerings: {
        create: data.offerings.map((o) => ({
          name: o.name,
          kind: o.kind,
          description: o.description,
          priceRange: o.priceRange,
        })),
      },
      events: {
        create: data.events
          .map((e) => ({
            title: e.title,
            startsAt: toDate(e.startsAt),
            endsAt: toDate(e.endsAt),
            address: e.address,
            notes: e.notes,
          }))
          .filter((e): e is typeof e & { startsAt: Date } => e.startsAt !== null),
      },
    },
  });

  await logAudit({
    actorId: user.id,
    action: "FAIR_CREATED",
    entityType: "Fair",
    entityId: fair.id,
    metadata: { status: fair.status },
  });
  if (submit) {
    await notifyAdminsOfNewFair(fair.name);
  }

  revalidatePath("/organizador");
  revalidatePath("/organizador/feirinhas");
  redirect(`/organizador/feirinhas/${fair.id}/editar?criada=1`);
}

async function notifyAdminsOfNewFair(fairName: string) {
  const admins = await prisma.user.findMany({ where: { role: ROLES.ADMIN }, select: { id: true } });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        userId: admin.id,
        type: NOTIFICATION_TYPES.MODERATION,
        title: "Nova feirinha aguardando revisão",
        body: `A feirinha "${fairName}" foi enviada para aprovação.`,
        link: "/admin/feirinhas",
      }),
    ),
  );
}

export async function updateFairAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const fairId = String(formData.get("fairId") ?? "");
  let user;
  try {
    user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  } catch (error) {
    return { ok: false, message: error instanceof AuthError ? error.message : "Sem permissão." };
  }

  if (!(await canManageFair(fairId, user))) {
    return { ok: false, message: "Você não pode editar esta feirinha." };
  }

  const parsed = readFairForm(formData);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Verifique os campos destacados.",
      errors: fieldErrors(parsed.error.issues),
    };
  }

  const data = parsed.data;
  const slug = await uniqueSlug(data.name, fairId);
  const submit = formData.get("intent") === "submit";
  const existingEvents = await prisma.fairEvent.count({ where: { fairId } });

  await prisma.$transaction([
    prisma.offering.deleteMany({ where: { fairId } }),
    prisma.fairEvent.deleteMany({ where: { fairId } }),
    prisma.fair.update({
      where: { id: fairId },
      data: {
        slug,
        name: data.name,
        shortDescription: data.shortDescription,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        coverImageUrl: data.coverImageUrl,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl,
        instagramUrl: data.instagramUrl,
        status: submit ? FAIR_STATUS.PENDING_REVIEW : undefined,
        rejectionReason: submit ? null : undefined,
        categories: { set: data.categories.map((slug) => ({ slug })) },
        offerings: {
          create: data.offerings.map((o) => ({
            name: o.name,
            kind: o.kind,
            description: o.description,
            priceRange: o.priceRange,
          })),
        },
        events: {
          create: data.events
            .map((e) => ({
              title: e.title,
              startsAt: toDate(e.startsAt),
              endsAt: toDate(e.endsAt),
              address: e.address,
              notes: e.notes,
            }))
            .filter((e): e is typeof e & { startsAt: Date } => e.startsAt !== null),
        },
      },
    }),
  ]);

  await logAudit({
    actorId: user.id,
    action: "FAIR_UPDATED",
    entityType: "Fair",
    entityId: fairId,
    metadata: { events: data.events.length },
  });

  if (submit) await notifyAdminsOfNewFair(data.name);

  if (data.events.length > existingEvents) {
    await notifyFairFollowers(fairId, {
      title: `Novos eventos em ${data.name}`,
      body: `${data.events.length - existingEvents} novo(s) evento(s) na agenda.`,
      link: `/feirinhas/${slug}`,
    });
  }

  revalidatePath(`/organizador/feirinhas/${fairId}/editar`);
  revalidatePath(`/feirinhas/${slug}`);
  return { ok: true, message: "Feirinha atualizada com sucesso." };
}

/* ---------------- Ciclo de vida e moderação ---------------- */

export async function submitFairForReviewAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  if (!(await canManageFair(fairId, user))) return;

  const fair = await prisma.fair.update({
    where: { id: fairId },
    data: { status: FAIR_STATUS.PENDING_REVIEW, rejectionReason: null },
  });
  await notifyAdminsOfNewFair(fair.name);
  await logAudit({ actorId: user.id, action: "FAIR_SUBMITTED", entityType: "Fair", entityId: fairId });
  revalidatePath("/organizador/feirinhas");
}

export async function deleteFairAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  if (!(await canManageFair(fairId, user))) return;

  await prisma.fair.delete({ where: { id: fairId } });
  await logAudit({ actorId: user.id, action: "FAIR_DELETED", entityType: "Fair", entityId: fairId });
  revalidatePath("/organizador/feirinhas");
  if (user.role === ROLES.ADMIN) revalidatePath("/admin/feirinhas");
}

export async function adminApproveFairAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const admin = await requireRole(ROLES.ADMIN);

  const fair = await prisma.fair.update({
    where: { id: fairId },
    data: { status: FAIR_STATUS.PUBLISHED, publishedAt: new Date(), rejectionReason: null },
  });

  await logAudit({ actorId: admin.id, action: "FAIR_APPROVED", entityType: "Fair", entityId: fairId });
  await createNotification({
    userId: fair.organizerId,
    type: NOTIFICATION_TYPES.FAIR_PUBLISHED,
    title: "Sua feirinha foi publicada",
    body: `"${fair.name}" já está visível na plataforma.`,
    link: `/feirinhas/${fair.slug}`,
  });
  await notifyFairFollowers(fairId, {
    title: `${fair.name} foi publicada`,
    body: "Confira a agenda e os detalhes da feirinha.",
    link: `/feirinhas/${fair.slug}`,
    type: NOTIFICATION_TYPES.FAIR_PUBLISHED,
  });

  revalidatePath("/admin/feirinhas");
  revalidatePath("/feirinhas");
}

export async function adminRejectFairAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const reason = String(formData.get("reason") ?? "Informações incompletas.");
  const admin = await requireRole(ROLES.ADMIN);

  const fair = await prisma.fair.update({
    where: { id: fairId },
    data: { status: FAIR_STATUS.REJECTED, rejectionReason: reason },
  });

  await logAudit({
    actorId: admin.id,
    action: "FAIR_REJECTED",
    entityType: "Fair",
    entityId: fairId,
    metadata: { reason },
  });
  await createNotification({
    userId: fair.organizerId,
    type: NOTIFICATION_TYPES.MODERATION,
    title: "Ajustes necessários na feirinha",
    body: reason,
    link: `/organizador/feirinhas/${fairId}/editar`,
  });
  revalidatePath("/admin/feirinhas");
}

export async function adminToggleFeaturedAction(formData: FormData): Promise<void> {
  const fairId = String(formData.get("fairId") ?? "");
  const admin = await requireRole(ROLES.ADMIN);
  const fair = await prisma.fair.findUnique({ where: { id: fairId }, select: { isFeatured: true } });
  if (!fair) return;

  await prisma.fair.update({ where: { id: fairId }, data: { isFeatured: !fair.isFeatured } });
  await logAudit({
    actorId: admin.id,
    action: "FAIR_FEATURED_TOGGLED",
    entityType: "Fair",
    entityId: fairId,
  });
  revalidatePath("/admin/feirinhas");
  revalidatePath("/");
}