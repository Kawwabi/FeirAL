import Link from "next/link";
import { Search, Sparkles, MapPinned, Calendar } from "lucide-react";
import { listActiveAds, listCategories, listPublishedFairs, listUpcomingEvents } from "@/lib/queries";
import { FairAdCard, FairCard } from "@/components/fair-card";
import { Card, SectionTitle, buttonClass } from "@/components/ui";

export default async function HomePage() {
  const [fairs, ads, events, categories] = await Promise.all([
    listPublishedFairs(),
    listActiveAds(3),
    listUpcomingEvents(5),
    listCategories(),
  ]);

  const featured = fairs.slice(0, 6);
  const eventsCount = events.length;
  const cities = Array.from(new Set(fairs.map((f) => f.city)));

  return (
    <div>
      <section className="border-b border-ink-200 bg-gradient-to-br from-brand-50 via-white to-emerald-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-semibold text-brand-600">
            <Sparkles size={13} /> {fairs.length} feirinhas publicadas
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
            Descubra as feirinhas de <span className="text-brand-500">Alagoas</span> perto de você
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-600">
            Artesanato, gastronomia, moda e eventos culturais em um só lugar. Encontre pelo mapa, pela agenda
            ou por categoria.
          </p>

          <form action="/feirinhas" method="get" className="mt-8 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                name="q"
                placeholder="O que você procura? Ex.: artesanato em Maceió"
                className="w-full rounded-xl border border-ink-300 bg-white py-3 pl-10 pr-3 text-sm shadow-sm focus-ring"
              />
            </div>
            <button type="submit" className={buttonClass("primary", "lg")}>
              Buscar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/categorias/${cat.slug}`}
                className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:border-brand-300 hover:text-brand-600"
              >
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/mapa" className={buttonClass("secondary", "lg")}>
              <MapPinned size={18} /> Abrir mapa interativo
            </Link>
            <Link href="/agenda" className={buttonClass("outline", "lg")}>
              <Calendar size={18} /> Ver agenda de eventos
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:px-6">
        {ads.length > 0 ? (
          <section>
            <SectionTitle title="Patrocinados" subtitle="Feirinhas que apoiam a plataforma" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <FairAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <SectionTitle
            title="Feirinhas em destaque"
            subtitle="Selecionadas para você"
            action={
              <Link href="/feirinhas" className="text-sm font-medium text-brand-600 hover:underline">
                Ver todas
              </Link>
            }
          />
          {featured.length === 0 ? (
            <Card className="p-8 text-center text-ink-500">
              Ainda não há feirinhas publicadas. Seja o primeiro organizador a cadastrar!
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((fair) => (
                <FairCard key={fair.id} fair={fair} />
              ))}
            </div>
          )}
        </section>

        <EventsHighlights fairs={fairs} events={events} />
        <HomeFooterInfo count={fairs.length} cityCount={cities.length} eventsCount={eventsCount} />
      </div>
    </div>
  );
}

function EventsHighlights({
  fairs,
  events,
}: {
  fairs: Awaited<ReturnType<typeof listPublishedFairs>>;
  events: Awaited<ReturnType<typeof listUpcomingEvents>>;
}) {
  const topRated = [...fairs]
    .filter((f) => f.ratingCount > 0)
    .sort((a, b) => b.ratingAverage - a.ratingAverage)
    .slice(0, 3);

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <SectionTitle title="Próximos eventos" subtitle="Não perca as próximas feirinhas" />
        <div className="space-y-3">
          {events.length === 0 ? (
            <Card className="p-6 text-sm text-ink-500">Nenhum evento futuro cadastrado.</Card>
          ) : (
            events.map((event) => (
              <Card key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/feirinhas/${event.fairSlug}`}
                    className="font-semibold text-ink-900 hover:text-brand-600"
                  >
                    {event.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-500">
                    {event.city} - {event.fairName}
                  </p>
                </div>
                <Link href="/agenda" className="text-xs font-medium text-brand-600 hover:underline">
                  Ver na agenda
                </Link>
              </Card>
            ))
          )}
        </div>
      </div>

      <div>
        <SectionTitle title="Mais bem avaliadas" />
        <div className="space-y-3">
          {topRated.length === 0 ? (
            <Card className="p-6 text-sm text-ink-500">Ainda sem avaliações.</Card>
          ) : (
            topRated.map((fair, index) => (
              <Card key={fair.id} className="flex items-center gap-3 p-4">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-sm font-bold text-brand-600">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/feirinhas/${fair.slug}`}
                    className="block truncate font-medium text-ink-900 hover:text-brand-600"
                  >
                    {fair.name}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {fair.city} - nota {fair.ratingAverage.toFixed(1)} ({fair.ratingCount})
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function HomeFooterInfo({
  count,
  cityCount,
  eventsCount,
}: {
  count: number;
  cityCount: number;
  eventsCount: number;
}) {
  return (
    <>
      <section className="grid gap-4 rounded-2xl border border-ink-200 bg-white p-6 sm:grid-cols-3">
        <div className="text-center">
          <p className="text-3xl font-bold text-brand-500">{count}</p>
          <p className="text-sm text-ink-500">feirinhas publicadas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-leaf-600">{cityCount}</p>
          <p className="text-sm text-ink-500">cidades de Alagoas</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-ink-900">{eventsCount}</p>
          <p className="text-sm text-ink-500">eventos na agenda</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-ink-900 p-8 text-white sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold">Organiza uma feirinha?</h2>
            <p className="mt-2 max-w-xl text-white/70">
              Cadastre gratuitamente, divulgue no mapa, monte sua agenda e alcance mais visitantes. Você pode
              impulsionar a visibilidade com anúncios patrocinados.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/organizador/feirinhas/nova"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Cadastrar minha feirinha
            </Link>
            <Link
              href="/sobre"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              Como funciona
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}