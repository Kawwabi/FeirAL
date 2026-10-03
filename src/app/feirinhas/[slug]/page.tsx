import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { getFairBySlug, isFollowing } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { summarizeRatings, distributionPercentages } from "@/lib/ratings";
import { coverImage, formatDate } from "@/lib/utils";
import { ROLES } from "@/lib/constants";
import { Stars } from "@/components/ui";
import { FairStatusBadge } from "@/components/status-badge";
import { FollowButton } from "@/components/follow-button";
import { FairBody, type CommentItem, type FairDetail } from "@/components/fair-detail-sections";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fair = await getFairBySlug(slug);
  if (!fair) return { title: "Feirinha não encontrada" };
  return { title: fair.name, description: fair.shortDescription ?? fair.description.slice(0, 150) };
}

export default async function FairDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [fair, user] = await Promise.all([getFairBySlug(slug), getCurrentUser()]);
  if (!fair) notFound();

  const isOwner = user?.id === fair.organizerId;
  const isAdmin = user?.role === ROLES.ADMIN;
  const canPreview = isOwner || isAdmin;
  if (fair.status !== "PUBLISHED" && !canPreview) notFound();

  const following = user ? await isFollowing(user.id, fair.id) : false;
  const summary = summarizeRatings(fair.reviews.map((r) => ({ rating: r.rating, status: r.status })));
  const percentages = distributionPercentages(summary.distribution);
  const myReview = user ? fair.reviews.find((r) => r.authorId === user.id) : undefined;

  const comments: CommentItem[] = fair.comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAtLabel: formatDate(comment.createdAt),
    author: comment.author,
    replies: comment.replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      createdAtLabel: formatDate(reply.createdAt),
      author: reply.author,
      replies: [],
    })),
  }));

  return (
    <div>
      {fair.status !== "PUBLISHED" ? (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          Pre-visualização - esta feirinha ainda não está visível publicamente.
        </div>
      ) : null}

      <div className="relative h-64 w-full overflow-hidden bg-ink-100 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coverImage(fair.coverImageUrl)} alt={fair.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-6 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              {fair.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/categorias/${cat.slug}`}
                  className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-800"
                >
                  {cat.icon ? `${cat.icon} ` : ""}
                  {cat.name}
                </Link>
              ))}
              <FairStatusBadge status={fair.status} />
            </div>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{fair.name}</h1>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-white/85">
              <MapPin size={14} /> {fair.address} - {fair.city}/{fair.state}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {summary.count > 0 ? (
              <span className="inline-flex items-center gap-2">
                <Stars value={summary.average} size={18} />
                <span className="text-sm font-semibold text-ink-800">{summary.average.toFixed(1)}</span>
                <span className="text-sm text-ink-500">({summary.count} avaliações)</span>
              </span>
            ) : (
              <span className="text-sm text-ink-500">Sem avaliações ainda</span>
            )}
            <span className="text-sm text-ink-500">{fair._count.followers} seguidores</span>
          </div>
          <FollowButton fairId={fair.id} slug={fair.slug} isFollowing={following} isLoggedIn={Boolean(user)} />
        </div>

        <FairBody
          fair={fair as FairDetail}
          user={user}
          summary={summary}
          percentages={percentages}
          myReview={myReview ? { rating: myReview.rating, title: myReview.title, content: myReview.content } : null}
          comments={comments}
          isAdmin={isAdmin}
          canPreview={canPreview}
        />
      </div>
    </div>
  );
}