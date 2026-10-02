import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buildAiContext, generateAssistantReply, type ChatTurn } from "@/lib/ai";

const COOKIE = "feiral_chat";

export async function POST(request: Request) {
  let body: { message?: string; history?: ChatTurn[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisicao invalida." }, { status: 400 });
  }

  const message = (body.message ?? "").trim();
  if (!message) {
    return NextResponse.json({ error: "Envie uma mensagem." }, { status: 400 });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
  const user = await getCurrentUser();

  const ctx = await buildAiContext();
  const turns: ChatTurn[] = [...history, { role: "user", content: message }];
  const reply = await generateAssistantReply(turns, ctx);

  // Persiste a conversa para monitoramento (best-effort).
  try {
    const store = await cookies();
    let sessionKey = store.get(COOKIE)?.value;
    if (!sessionKey) {
      sessionKey = randomUUID();
    }

    const conversation = await prisma.conversation.upsert({
      where: { sessionKey },
      create: { sessionKey, userId: user?.id ?? null },
      update: { userId: user?.id ?? null },
    });

    await prisma.chatMessage.createMany({
      data: [
        { conversationId: conversation.id, role: "user", content: message },
        { conversationId: conversation.id, role: "assistant", content: reply },
      ],
    });

    const response = NextResponse.json({ reply, context: { totalFairs: ctx.totalFairs } });
    response.cookies.set(COOKIE, sessionKey, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch {
    return NextResponse.json({ reply });
  }
}