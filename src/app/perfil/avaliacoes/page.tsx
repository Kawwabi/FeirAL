import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { deleteReviewAction } from "@/app/actions/community";
import { formatDate } from "@/lib/utils";
import { Badge, Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Minhas avaliacoes" };

export default async function MyReviewsPage() {
  const user = await requireUser();
  const reviews = await prisma.review.findMany({
    where: { authorId: user.id },
    orderBy: { createdAt: "desc" },
    include: { fair: { select: { slug: true, name: true, city: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minha conta"
        title="Minhas avaliacoes"
        description="Avaliacoes e comentarios que voce publicou sobre as feirinhas."
      />

      {reviews.length === 0 ? (
        <EmptyState
          icon={<Star size={28} />}
          title="Voce ainda nao avaliou nenhuma feirinha"
          description="Visite uma feirinha e compartilhe sua experiencia para ajudar outras pessoas."
          action={
            <Link href="/feirinhas" className={buttonClass("primary")}>
              Explorar feirinhas
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/feirinhas/${review.fair.slug}`}
                    className="font-semibold text-ink-900 hover:text-brand-700"
                  >
                    {review.fair.name}
                  </Link>
                  <p className="text-xs text-ink-500">{review.fair.city} - AL</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="warning">
                    <Star size={12} fill="currentColor" /> {review.rating}/5
                  </Badge>
                  <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
                </div>
              </div>
              {review.title ? <p className="mt-2 font-medium text-ink-800">{review.title}</p> : null}
              <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{review.content}</p>
              <div className="mt-3 flex gap-3">
                <Link href={`/feirinhas/${review.fair.slug}#avaliacoes`} className={buttonClass("outline", "sm")}>
                  Editar no site
                </Link>
                <form action={deleteReviewAction}>
                  <input type="hidden" name="reviewId" value={review.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}