"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ROLES } from "@/lib/constants";

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const admin = await requireRole(ROLES.ADMIN);
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!["VISITOR", "ORGANIZER", "ADMIN"].includes(role)) return;
  if (userId === admin.id && role !== "ADMIN") return; // nao rebaixa a si mesmo

  await prisma.user.update({ where: { id: userId }, data: { role } });
  await logAudit({
    actorId: admin.id,
    action: "USER_ROLE_CHANGED",
    entityType: "User",
    entityId: userId,
    metadata: { role },
  });
  revalidatePath("/admin/usuarios");
}

export async function resolveReportAction(formData: FormData): Promise<void> {
  const admin = await requireRole(ROLES.ADMIN);
  const reportId = String(formData.get("reportId") ?? "");
  const status = String(formData.get("status") ?? "RESOLVED");
  const note = String(formData.get("note") ?? "");

  if (!["RESOLVED", "DISMISSED", "OPEN"].includes(status)) return;

  await prisma.moderationReport.update({
    where: { id: reportId },
    data: {
      status,
      resolutionNote: note || null,
      handledById: admin.id,
      resolvedAt: status === "OPEN" ? null : new Date(),
    },
  });

  await logAudit({
    actorId: admin.id,
    action: "REPORT_RESOLVED",
    entityType: "ModerationReport",
    entityId: reportId,
    metadata: { status },
  });
  revalidatePath("/admin/denuncias");
}
