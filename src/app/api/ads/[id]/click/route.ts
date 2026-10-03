import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Contabiliza um clique em anúncio patrocinado e redireciona para a feirinha. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const ad = await prisma.advertisement.findUnique({
    where: { id },
    select: { id: true, fair: { select: { slug: true } } },
  });

  if (!ad) {
    return NextResponse.redirect(new URL("/feirinhas", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
  }

  await prisma.advertisement.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${base}/feirinhas/${ad.fair.slug}?utm_source=feiral&utm_medium=ad`);
}