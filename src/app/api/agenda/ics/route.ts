import { NextResponse } from "next/server";
import { buildIcs } from "@/lib/calendar";
import { listUpcomingEvents } from "@/lib/queries";

/** Exporta a agenda de eventos futuros no formato .ics (Google Agenda, Outlook, Apple). */
export async function GET() {
  const events = await listUpcomingEvents(200);

  const ics = buildIcs(
    events.map((e) => ({
      title: `${e.title} - ${e.fairName}`,
      description: `Feirinha ${e.fairName} em ${e.city}. Mais detalhes em FeirAL.`,
      location: e.address ?? `${e.city}, AL`,
      start: e.startsAt,
      end: e.endsAt ?? undefined,
    })),
    "Agenda FeirAL",
  );

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="feiral-agenda.ics"',
    },
  });
}