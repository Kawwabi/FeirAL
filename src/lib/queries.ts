import "server-only";
import { prisma } from "./prisma";
import type { FilterableFair } from "./filters";

export interface FairListItem extends FilterableFair {
  slug: string;
  shortDescription: string | null;
  coverImageUrl: string | null;
  nextEventTitle: string | null;
  categories: { slug: string; name: string; icon: string | null; color: string | null }[];
  ratingAverage: number;
  ratingCount: number;
  followerCount: number;
  eventCount: number;
}

async function ratingMap(): Promise<Map<string, { avg: number; count: number }>> {
  const rows = await prisma.review.groupBy({
    by: ["fairId"],
    where: { status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { _all: true },
  });
  const map = new Map<string, { avg: number; count: number }>();
  for (const row of rows) {
    map.set(row.fairId, {
      avg: Math.round((row._avg.rating ?? 0) * 10) / 10,
      count: row._count._all,
    });
  }
  return map;
}

/** Lista feirinhas publicadas com dados agregados para cards, mapa e filtros. */
export async function listPublishedFairs(): Promise<FairListItem[]> {
  const [fairs, ratings] = await Promise.all([
    prisma.fair.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        categories: { select: { slug: true, name: true, icon: true, color: true } },
        events: { orderBy: { startsAt: "asc" }, select: { startsAt: true, title: true } },
        _count: { select: { followers: true, events: true } },
      },
    }),
    ratingMap(),
  ]);

  const now = Date.now();

  return fairs.map((fair) => {
    const upcoming = fair.events.filter((e) => e.startsAt.getTime() >= now);
    const next = upcoming[0] ?? fair.events[fair.events.length - 1];
    const rating = ratings.get(fair.id);

    return {
      id: fair.id,
      slug: fair.slug,
      name: fair.name,
      description: fair.description,
      shortDescription: fair.shortDescription,
      city: fair.city,
      state: fair.state,
      latitude: fair.latitude,
      longitude: fair.longitude,
      status: fair.status,
      coverImageUrl: fair.coverImageUrl,
      categorySlugs: fair.categories.map((c) => c.slug),
      categories: fair.categories,
      nextEventAt: next ? next.startsAt.toISOString() : null,
      nextEventTitle: next ? next.title : null,
      ratingAverage: rating?.avg ?? 0,
      ratingCount: rating?.count ?? 0,
      followerCount: fair._count.followers,
      eventCount: fair._count.events,
    };
  });
}

export async function listCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

/** Feirinhas por categoria (slug) para páginas de categoria. */
export async function listFairsByCategory(slug: string): Promise<FairListItem[]> {
  const all = await listPublishedFairs();
  return all.filter((f) => f.categorySlugs.includes(slug));
}

export interface AgendaEvent {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  address: string | null;
  city: string;
  fairSlug: string;
  fairName: string;
  categorySlugs: string[];
  coverImageUrl: string | null;
}

/** Eventos futuros de feirinhas publicadas, usados na agenda. */
export async function listUpcomingEvents(limit = 100): Promise<AgendaEvent[]> {
  const events = await prisma.fairEvent.findMany({
    where: {
      startsAt: { gte: new Date() },
      fair: { status: "PUBLISHED" },
    },
    orderBy: { startsAt: "asc" },
    take: limit,
    include: {
      fair: {
        select: {
          slug: true,
          name: true,
          city: true,
          coverImageUrl: true,
          categories: { select: { slug: true } },
        },
      },
    },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    address: e.address,
    city: e.fair.city,
    fairSlug: e.fair.slug,
    fairName: e.fair.name,
    categorySlugs: e.fair.categories.map((c) => c.slug),
    coverImageUrl: e.fair.coverImageUrl,
  }));
}

export async function getFairBySlug(slug: string) {
  return prisma.fair.findUnique({
    where: { slug },
    include: {
      categories: true,
      offerings: { orderBy: { name: "asc" } },
      events: { orderBy: { startsAt: "asc" } },
      organizer: { select: { id: true, name: true, email: true, avatarUrl: true } },
      reviews: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
      comments: {
        where: { parentId: null, status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, avatarUrl: true } },
          replies: {
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "asc" },
            include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          },
        },
      },
      feedbacks: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      },
      _count: { select: { followers: true } },
    },
  });
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function listNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
}

export async function getUserFollows(userId: string) {
  return prisma.follow.findMany({
    where: { userId },
    include: {
      fair: { select: { id: true, slug: true, name: true, city: true, coverImageUrl: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function isFollowing(userId: string, fairId: string): Promise<boolean> {
  const row = await prisma.follow.findUnique({
    where: { userId_fairId: { userId, fairId } },
    select: { id: true },
  });
  return Boolean(row);
}

/** Anúncios ativos priorizados por nível (PREMIUM > STANDARD > BASIC). */
export async function listActiveAds(limit = 6) {
  const order = ["PREMIUM", "STANDARD", "BASIC"];
  const ads = await prisma.advertisement.findMany({
    where: { status: "ACTIVE", startsAt: { lte: new Date() }, endsAt: { gte: new Date() } },
    include: {
      fair: { select: { slug: true, name: true, city: true, coverImageUrl: true } },
      owner: { select: { name: true } },
    },
  });
  return ads
    .sort((a, b) => order.indexOf(a.tier) - order.indexOf(b.tier))
    .slice(0, limit);
}