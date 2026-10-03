import Link from "next/link";
import { MapPin, Calendar, Star, Heart, Sparkles } from "lucide-react";
import type { FairListItem } from "@/lib/queries";
import { Badge, Stars } from "@/components/ui";
import { coverImage, formatDateTime, truncate } from "@/lib/utils";

export function FairCard({ fair }: { fair: FairListItem }) {
  const description = fair.shortDescription || truncate(fair.description, 130);

  return (
    <article className="group card-surface flex flex-col overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/feirinhas/${fair.slug}`} className="block shrink-0">
        <div className="relative h-44 w-full overflow-hidden bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage(fair.coverImageUrl)}
            alt={fair.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {fair.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.slug}
                className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-ink-700 shadow-sm"
              >
                {cat.icon ? `${cat.icon} ` : ""}
                {cat.name}
              </span>
            ))}
          </div>
          {fair.ratingCount > 0 ? (
            <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-ink-800 shadow-sm">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              {fair.ratingAverage.toFixed(1)}
            </div>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/feirinhas/${fair.slug}`}>
          <h3 className="line-clamp-1 text-base font-semibold text-ink-900 transition-colors group-hover:text-brand-600">
            {fair.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-2 text-sm text-ink-500">{description}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 pb-3 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {fair.city} - {fair.state}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={13} /> {fair.followerCount} seguidores
          </span>
        </div>

        <div className="mt-auto border-t border-ink-100 pt-3">
          {fair.nextEventAt ? (
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-leaf-700">
              <Calendar size={13} /> {formatDateTime(fair.nextEventAt)}
            </p>
          ) : (
            <p className="text-xs text-ink-400">Sem evento agendado</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function FairAdCard({
  ad,
}: {
  ad: {
    id: string;
    title: string;
    description: string | null;
    tier: string;
    imageUrl: string | null;
    fair: { slug: string; name: string; city: string; coverImageUrl: string | null };
  };
}) {
  const tierLabel =
    ({ BASIC: "Básico", STANDARD: "Padrão", PREMIUM: "Premium" } as Record<string, string>)[ad.tier] ?? ad.tier;

  return (
    <a
      href={`/api/ads/${ad.id}/click`}
      className="group relative block overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge tone="warning">
          <Sparkles size={12} /> Patrocinado
        </Badge>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">{tierLabel}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverImage(ad.imageUrl ?? ad.fair.coverImageUrl)}
        alt={ad.title}
        className="mb-3 h-28 w-full rounded-xl object-cover"
        loading="lazy"
      />
      <h3 className="text-sm font-semibold text-ink-900 transition-colors group-hover:text-brand-600">{ad.title}</h3>
      <p className="mt-1 line-clamp-2 text-xs text-ink-500">{ad.description ?? ad.fair.name}</p>
      <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-600">
        <MapPin size={12} /> {ad.fair.city}
      </p>
    </a>
  );
}

export function FairListItemRow({ fair }: { fair: FairListItem }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link
        href={`/feirinhas/${fair.slug}`}
        className="h-40 w-full shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:h-32 sm:w-48"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverImage(fair.coverImageUrl)}
          alt={fair.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/feirinhas/${fair.slug}`}
            className="text-lg font-semibold text-ink-900 hover:text-brand-600"
          >
            {fair.name}
          </Link>
          {fair.categories.map((c) => (
            <Badge key={c.slug} tone="neutral">
              {c.icon ? `${c.icon} ` : ""}
              {c.name}
            </Badge>
          ))}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink-500">
          {fair.shortDescription || truncate(fair.description, 200)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-500">
          <span className="inline-flex items-center gap-1">
            <MapPin size={13} /> {fair.city} - {fair.state}
          </span>
          {fair.nextEventAt ? (
            <span className="inline-flex items-center gap-1 text-leaf-700">
              <Calendar size={13} /> {formatDateTime(fair.nextEventAt)}
            </span>
          ) : null}
          {fair.ratingCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Stars value={fair.ratingAverage} size={13} /> ({fair.ratingCount})
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}