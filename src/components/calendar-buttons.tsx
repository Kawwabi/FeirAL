import { CalendarPlus } from "lucide-react";
import { googleCalendarUrl, type CalendarEventInput } from "@/lib/calendar";

export function GoogleCalendarButton({
  event,
  label = "Adicionar ao Google Agenda",
  className,
}: {
  event: CalendarEventInput;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={googleCalendarUrl(event)}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
      }
    >
      <CalendarPlus size={15} /> {label}
    </a>
  );
}

export function IcsDownloadButton({
  label = "Baixar agenda (.ics)",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <a
      href="/api/agenda/ics"
      download
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
      }
    >
      <CalendarPlus size={15} /> {label}
    </a>
  );
}