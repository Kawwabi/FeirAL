import { NextResponse } from "next/server";
import { destroySessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  await destroySessionCookie();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}