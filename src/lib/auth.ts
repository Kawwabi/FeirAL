import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { ROLES, type Role } from "./constants";

const COOKIE_NAME = "feiral_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 dias

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? "feiral-dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string | null;
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await createSessionToken(userId);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Le o usuario autenticado a partir do cookie de sessao (sempre validado no banco). */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const userId = payload.sub;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, avatarUrl: true },
    });
    if (!user) return null;

    return { ...user, role: user.role as Role };
  } catch {
    return null;
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

/** Garante que existe um usuario logado; lanca AuthError caso contrario. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Voce precisa entrar na plataforma.");
  return user;
}

/** Garante que o usuario possui um dos papeis exigidos. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("Voce nao tem permissao para acessar este recurso.");
  }
  return user;
}

export async function canManageFair(fairId: string, user: SessionUser): Promise<boolean> {
  if (user.role === ROLES.ADMIN) return true;
  const fair = await prisma.fair.findUnique({ where: { id: fairId }, select: { organizerId: true } });
  return Boolean(fair && fair.organizerId === user.id);
}

export { COOKIE_NAME };