import { describe, expect, it } from "vitest";
import { buildIcs, googleCalendarUrl, groupEventsByDay, toGoogleDate } from "@/lib/calendar";

describe("toGoogleDate", () => {
  it("formata em UTC compacto", () => {
    expect(toGoogleDate(new Date("2026-03-15T13:30:00.000Z"))).toBe("20260315T133000Z");
  });
});

describe("googleCalendarUrl", () => {
  it("gera um link valido do Google Agenda com datas e local", () => {
    const url = googleCalendarUrl({
      title: "Feirinha de sabado",
      location: "Maceio, AL",
      start: "2026-03-15T13:30:00.000Z",
      end: "2026-03-15T20:00:00.000Z",
    });
    expect(url.startsWith("https://calendar.google.com/calendar/render?")).toBe(true);
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("20260315T133000Z%2F20260315T200000Z");
    expect(url).toContain("Maceio");
  });

  it("assume 2 horas de duracao quando nao informa o fim", () => {
    const url = googleCalendarUrl({ title: "Evento", start: "2026-03-15T13:30:00.000Z" });
    expect(url).toContain("20260315T133000Z%2F20260315T153000Z");
  });
});

describe("buildIcs", () => {
  it("gera um arquivo .ics com os eventos informados", () => {
    const ics = buildIcs([
      {
        title: "Feirinha",
        description: "Descricao",
        location: "Pajucara",
        start: "2026-03-15T13:30:00.000Z",
        end: "2026-03-15T20:00:00.000Z",
      },
    ]);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Feirinha");
    expect(ics).toContain("DTSTART:20260315T133000Z");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("escapa caracteres especiais do formato iCalendar", () => {
    const ics = buildIcs([{ title: "Feira, comida; musica", start: "2026-03-15T13:30:00.000Z" }]);
    expect(ics).toContain("SUMMARY:Feira\\, comida\\; musica");
  });
});

describe("groupEventsByDay", () => {
  it("agrupa eventos por dia preservando a ordem cronologica", () => {
    const grouped = groupEventsByDay([
      { id: "a", startsAt: "2026-03-16T10:00:00.000Z" },
      { id: "b", startsAt: "2026-03-15T10:00:00.000Z" },
      { id: "c", startsAt: "2026-03-15T18:00:00.000Z" },
    ]);
    expect(grouped).toHaveLength(2);
    expect(grouped[0].day).toBe("2026-03-15");
    expect(grouped[0].events).toHaveLength(2);
    expect(grouped[1].day).toBe("2026-03-16");
  });
});