"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, requireRole, AuthError } from "@/lib/auth";
import { reviewSchema, commentSchema, feedbackSchema, reportSchema } from "@/lib/validation";
import { fieldErrors, type ActionState } from "@/lib/action-state";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { NOTIFICATION_TYPES, ROLES, CONTENT_STATUS } from "@/lib/constants";

async function fairSlug(fairId: string): Promise<string | null> {
  const fair = await prisma.fair.findUnique({ where: { id: fairId }, select: { slug: true } });
  return fair?.slug ?? null;
}

export async function upsertReviewAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Entre na plataforma para avaliar." };
  }

  const parsed = reviewSchema.safeParse({
    fairId: formData.get("fairId"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    content: formData.get("content"),
    visitedAt: formData.get("visitedAt") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira a avaliacao.", errors: fieldErrors(parsed.error.issues) };
  }

  const { fairId, rating, title, content, visitedAt } = parsed.data;
  const fair = await prisma.fair.findUnique({
    where: { id: fairId },
    select: { slug: true, organizerId: true, name: true },
  });
  if (!fair) return { ok: false, message: "Feirinha nao encontrada." };

  await prisma.review.upsert({
    where: { fairId_authorId: { fairId, authorId: user.id } },
    create: {
      fairId,
      authorId: user.id,
      rating,
      title,
      content,
      visitedAt: visitedAt ? new Date(visitedAt) : null,
    },
    update: { rating, title, content, visitedAt: visitedAt ? new Date(visitedAt) : null },
  });

  await logAudit({ actorId: user.id, action: "REVIEW_UPSERTED", entityType: "Fair", entityId: fairId });

  if (fair.organizerId !== user.id) {
    await createNotification({
      userId: fair.organizerId,
      type: NOTIFICATION_TYPES.REVIEW_REPLY,
      title: `Nova avaliacao em ${fair.name}`,
      body: `${user.name} avaliou a feirinha com ${rating} estrela(s).`,
      link: `/feirinhas/${fair.slug}#avaliacoes`,
    });
  }

  revalidatePath(`/feirinhas/${fair.slug}`);
  revalidatePath("/perfil/avaliacoes");
  return { ok: true, message: "Avaliacao publicada. Obrigado!" };
}

export async function deleteReviewAction(formData: FormData): Promise<void> {
  const reviewId = String(formData.get("reviewId") ?? "");
  const user = await requireUser();
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;

  const isOwner = review.authorId === user.id;
  if (!isOwner && user.role !== ROLES.ADMIN) return;

  await prisma.review.delete({ where: { id: reviewId } });
  await logAudit({ actorId: user.id, action: "REVIEW_DELETED", entityType: "Review", entityId: reviewId });
  const slug = await fairSlug(review.fairId);
  if (slug) revalidatePath(`/feirinhas/${slug}`);
  revalidatePath("/perfil/avaliacoes");
}

export async function addCommentAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Entre para comentar." };
  }

  const parsed = commentSchema.safeParse({
    fairId: formData.get("fairId"),
    parentId: formData.get("parentId") || undefined,
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Escreva um comentario valido.", errors: fieldErrors(parsed.error.issues) };
  }

  const slug = await fairSlug(parsed.data.fairId);
  if (!slug) return { ok: false, message: "Feirinha nao encontrada." };

  await prisma.comment.create({
    data: {
      fairId: parsed.data.fairId,
      authorId: user.id,
      parentId: parsed.data.parentId,
      content: parsed.data.content,
    },
  });

  await logAudit({ actorId: user.id, action: "COMMENT_CREATED", entityType: "Fair", entityId: parsed.data.fairId });
  revalidatePath(`/feirinhas/${slug}`);
  return { ok: true, message: "Comentario adicionado." };
}

export async function deleteCommentAction(formData: FormData): Promise<void> {
  const commentId = String(formData.get("commentId") ?? "");
  const user = await requireUser();
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return;

  const isOwner = comment.authorId === user.id;
  if (!isOwner && user.role !== ROLES.ADMIN) return;

  await prisma.comment.delete({ where: { id: commentId } });
  await logAudit({ actorId: user.id, action: "COMMENT_DELETED", entityType: "Comment", entityId: commentId });
  const slug = await fairSlug(comment.fairId);
  if (slug) revalidatePath(`/feirinhas/${slug}`);
}

export async function submitFeedbackAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof AuthError
          ? "Apenas organizadores podem enviar feedback de participacao."
          : "Sem permissao.",
    };
  }

  const parsed = feedbackSchema.safeParse({
    fairId: formData.get("fairId"),
    experience: formData.get("experience"),
    suggestions: formData.get("suggestions") || undefined,
    wouldParticipateAgain: formData.get("wouldParticipateAgain") === "on",
    organizationScore: formData.get("organizationScore") ?? 5,
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira o formulario.", errors: fieldErrors(parsed.error.issues) };
  }

  const slug = await fairSlug(parsed.data.fairId);
  if (!slug) return { ok: false, message: "Feirinha nao encontrada." };

  await prisma.organizerFeedback.create({
    data: {
      fairId: parsed.data.fairId,
      authorId: user.id,
      experience: parsed.data.experience,
      suggestions: parsed.data.suggestions,
      wouldParticipateAgain: parsed.data.wouldParticipateAgain,
      organizationScore: parsed.data.organizationScore,
    },
  });

  await logAudit({ actorId: user.id, action: "FEEDBACK_SUBMITTED", entityType: "Fair", entityId: parsed.data.fairId });
  revalidatePath(`/feirinhas/${slug}`);
  revalidatePath("/organizador/feedback");
  return { ok: true, message: "Feedback enviado. Obrigado por contribuir!" };
}

export async function createReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch {
    return { ok: false, message: "Entre para denunciar." };
  }

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    reason: formData.get("reason"),
    details: formData.get("details") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Confira os dados da denuncia.", errors: fieldErrors(parsed.error.issues) };
  }

  await prisma.moderationReport.create({
    data: {
      targetType: parsed.data.targetType,
      targetId: parsed.data.targetId,
      reporterId: user.id,
      reason: parsed.data.reason,
      details: parsed.data.details,
    },
  });

  await logAudit({
    actorId: user.id,
    action: "REPORT_CREATED",
    entityType: parsed.data.targetType,
    entityId: parsed.data.targetId,
    metadata: { reason: parsed.data.reason },
  });

  return { ok: true, message: "Denuncia registrada. Nossa equipe vai analisar." };
}

/** Marca um conteudo como oculto (usado pelo admin na fila de moderacao). */
export async function hideContentAction(formData: FormData): Promise<void> {
  const type = String(formData.get("type") ?? "");
  const id = String(formData.get("id") ?? "");
  const admin = await requireRole(ROLES.ADMIN);

  if (type === "REVIEW") {
    await prisma.review.update({ where: { id }, data: { status: CONTENT_STATUS.HIDDEN } });
  } else if (type === "COMMENT") {
    await prisma.comment.update({ where: { id }, data: { status: CONTENT_STATUS.HIDDEN } });
  } else if (type === "FEEDBACK") {
    await prisma.organizerFeedback.update({ where: { id }, data: { status: CONTENT_STATUS.HIDDEN } });
  }

  await logAudit({ actorId: admin.id, action: "CONTENT_HIDDEN", entityType: type, entityId: id });
  revalidatePath("/admin/denuncias");
}