import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { Badge, Card, EmptyState, PageHeader, Stat } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { averageOf } from "@/lib/ratings";

export const metadata: Metadata = { title: "Feedbacks recebidos" };

export default async function OrganizerFeedbackPage() {
  const user = await requireRole(ROLES.ORGANIZER, ROLES.ADMIN);

  const feedbacks = await prisma.organizerFeedback.findMany({
    where: {
      status: "PUBLISHED",
      fair: user.role === ROLES.ADMIN ? {} : { organizerId: user.id },
    },
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true } },
      fair: { select: { name: true, slug: true } },
    },
  });

  const avg = averageOf(feedbacks.map((f) => f.organizationScore));
  const wouldReturn = feedbacks.filter((f) => f.wouldParticipateAgain).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organizador"
        title="Feedbacks dos organizadores"
        description="Veja o que outros organizadores acharam das suas feirinhas e as sugestões de melhoria."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Feedbacks" value={feedbacks.length} icon={<Lightbulb size={16} />} />
        <Stat label="Nota média" value={avg.toFixed(1)} hint="organização (1-5)" tone="success" />
        <Stat label="Participariam novamente" value={wouldReturn} tone="brand" />
      </div>

      {feedbacks.length === 0 ? (
        <EmptyState
          icon={<Lightbulb size={28} />}
          title="Nenhum feedback recebido"
          description="Quando outros organizadores avaliarem sua feirinha, os feedbacks aparecerão aqui."
        />
      ) : (
        <div className="space-y-3">
          {feedbacks.map((feedback) => (
            <Card key={feedback.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-ink-800">{feedback.author.name}</span>
                  <Link
                    href={`/feirinhas/${feedback.fair.slug}`}
                    className="text-xs font-medium text-brand-600 hover:underline"
                  >
                    {feedback.fair.name}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="info">organização {feedback.organizationScore}/5</Badge>
                  <Badge tone={feedback.wouldParticipateAgain ? "success" : "neutral"}>
                    {feedback.wouldParticipateAgain ? (
                      <>
                        <Check size={11} /> Participaria novamente
                      </>
                    ) : (
                      <>
                        <X size={11} /> Não participaria
                      </>
                    )}
                  </Badge>
                  <span className="text-xs text-ink-400">{formatDate(feedback.createdAt)}</span>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-600">{feedback.experience}</p>
              {feedback.suggestions ? (
                <p className="mt-2 rounded-lg bg-ink-50 p-3 text-xs text-ink-600">
                  <strong>Sugestões de melhoria:</strong> {feedback.suggestions}
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}