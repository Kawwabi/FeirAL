// Integracao com Google Agenda via deep link + exportacao .ics (sem necessidade de OAuth).
// Referencia: https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs

export interface CalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  start: Date | string;
  end?: Date | string;
  url?: string;
}

/** Converte uma data para o formato UTC compacto exigido pelo Google Calendar: YYYYMMDDTHHMMSSZ */
export function toGoogleDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function toIcsDate(value: Date | string): string {
  return toGoogleDate(value);
}

/** Gera o link "Adicionar ao Google Agenda". */
export function googleCalendarUrl(event: CalendarEventInput): string {
  const start = new Date(event.start);
  const end = event.end ? new Date(event.end) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
  });

  if (event.description) params.set("details", event.description);
  if (event.location) params.set("location", event.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/** Gera o conteudo de um arquivo .ics (compativel com Google Agenda, Outlook, Apple). */
export function buildIcs(events: CalendarEventInput[], calendarName = "FeirAL"): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FeirAL//Agenda de feirinhas//PT-BR",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeIcs(calendarName)}`,
  ];

  events.forEach((event, index) => {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `UID:feiral-${index}-${start.getTime()}@feiral.app`,
      `DTSTAMP:${toIcsDate(new Date())}`,
      `DTSTART:${toIcsDate(start)}`,
      `DTEND:${toIcsDate(end)}`,
      `SUMMARY:${escapeIcs(event.title)}`,
    );
    if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
    if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
    if (event.url) lines.push(`URL:${event.url}`);
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Agrupa eventos por dia (chave YYYY-MM-DD) preservando a ordem cronologica. */
export function groupEventsByDay<T extends { startsAt: Date | string }>(
  events: T[],
): Array<{ day: string; label: string; events: T[] }> {
  const groups = new Map<string, T[]>();

  for (const event of events) {
    const d = new Date(event.startsAt);
    const key = d.toISOString().slice(0, 10);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, list]) => {
      const d = new Date(`${day}T12:00:00`);
      const label = d.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      return { day, label: label.charAt(0).toUpperCase() + label.slice(1), events: list };
    });
}