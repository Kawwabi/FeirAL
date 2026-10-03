"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  setSessionCookie,
  destroySessionCookie,
} from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
} from "@/lib/validation";
import { fieldErrors, type ActionState } from "@/lib/action-state";
import { logAudit } from "@/lib/audit";
import { randomBytes } from "node:crypto";

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "VISITOR",
    city: formData.get("city") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: "Verifique os campos destacados.", errors: fieldErrors(parsed.error.issues) };
  }

  const { name, email, password, role, city } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { ok: false, errors: { email: "Este e-mail já está cadastrado." } };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      role,
      city: city || null,
      notificationPref: { create: {} },
    },
  });

  await logAudit({ actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id });
  await setSessionCookie(user.id);
  redirect("/perfil");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Verifique os campos destacados.", errors: fieldErrors(parsed.error.issues) };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, message: "E-mail ou senha incorretos." };
  }

  await setSessionCookie(user.id);
  await logAudit({ actorId: user.id, action: "USER_LOGIN", entityType: "User", entityId: user.id });
  redirect("/perfil");
}

export async function logoutAction(): Promise<void> {
  await destroySessionCookie();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordResetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error.issues) };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Resposta genérica para não revelar se o e-mail existe.
  if (!user) {
    return {
      ok: true,
      message: "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.",
    };
  }

  const token = randomBytes(24).toString("hex");
  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt: new Date(Date.now() + 1000 * 60 * 60) },
  });

  // Ambiente de demonstração: não há serviço de e-mail, então exibimos o link na tela.
  return {
    ok: true,
    message: `Link de recuperação gerado: /redefinir-senha?token=${token} (valido por 1 hora).`,
  };
}

export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordResetSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: "Verifique os dados.", errors: fieldErrors(parsed.error.issues) };
  }

  const record = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return { ok: false, message: "Token inválido ou expirado." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await hashPassword(parsed.data.password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect("/entrar?redefinido=1");
}