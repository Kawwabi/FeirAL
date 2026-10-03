import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { AgendaEvent } from "@/lib/queries";
import { GoogleCalendarButton } from "@/components/calendar-buttons";
import { Card } from "@/components/ui";
import { formatTime } from "@/lib/utils";

/** Lista de eventos agrupados por dia (usada na página de agenda). */
export function AgendaList({
  grouped,
}: {
  grouped: { day: string; label: string; events: AgendaEvent[] }[];
}) {
  return (
    <div className="space-y-8">
      {grouped.map((group) => (
        <section key={group.day}>
          <h2 className="mb-3 inline-flex items-center gap-2 text-lg font-semibold text-ink-900">
            <Calendar size={18} className="text-brand-500" /> {group.label}
          </h2>
          <div className="space-y-3">
            {group.events.map((event) => (
              <Card key={event.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/feirinhas/${event.fairSlug}`}
                    className="font-semibold text-ink-900 hover:text-brand-600"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={12} /> {formatTime(event.startsAt)}
                      {event.endsAt ? ` - ${formatTime(event.endsAt)}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} /> {event.address ?? event.city}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-400">Feirinha: {event.fairName}</p>
                </div>
                <GoogleCalendarButton
                  event={{
                    title: `${event.title} - ${event.fairName}`,
                    location: event.address ?? `${event.city}, AL`,
                    start: event.startsAt,
                    end: event.endsAt ?? undefined,
                  }}
                  label="Google Agenda"
                />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}