import Link from "next/link";
import { Calendar, Globe, Mail, Phone, Lightbulb, Check, MapPin, Tag } from "lucide-react";
import type { getFairBySlug } from "@/lib/queries";
import { coverImage, formatDateTime, formatDate, initials } from "@/lib/utils";
import { Badge, Card, SectionTitle, Stars, buttonClass } from "@/components/ui";
import { FairMap } from "@/components/fair-map";
import { GoogleCalendarButton } from "@/components/calendar-buttons";
import { ReviewForm } from "@/components/review-form";
import { CommentSection, type CommentItem } from "@/components/comment-section";
import { OrganizerFeedbackForm } from "@/components/feedback-form";
import { ReportForm } from "@/components/report-form";
import { deleteReviewAction } from "@/app/actions/community";
import type { SessionUser } from "@/lib/auth";
import type { RatingSummary } from "@/lib/ratings";
import { averageOf } from "@/lib/ratings";

export type FairDetail = NonNullable<Awaited<ReturnType<typeof getFairBySlug>>>;
export type { CommentItem };

interface BodyProps {
  fair: FairDetail;
  user: SessionUser | null;
  summary: RatingSummary;
  percentages: Record<1 | 2 | 3 | 4 | 5, number>;
  myReview: { rating: number; title: string | null; content: string } | null;
  comments: CommentItem[];
  isAdmin: boolean;
  canPreview: boolean;
}

export function FairBody({ fair, user, summary, percentages, myReview, comments, isAdmin, canPreview }: BodyProps) {
  const eventInput = fair.events.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt ? e.endsAt.toISOString() : null,
    address: e.address,
    notes: e.notes,
  }));

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section>
          <SectionTitle title="Sobre a feirinha" />
          <Card className="p-6">
            {fair.shortDescription ? (
              <p className="mb-3 text-lg font-medium text-ink-700">{fair.shortDescription}</p>
            ) : null}
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{fair.description}</p>
          </Card>
        </section>

        <OfferingsSection offerings={fair.offerings} />

        <EventsSection fairName={fair.name} city={fair.city} address={fair.address} events={eventInput} />

        {fair.latitude != null && fair.longitude != null ? (
          <section>
            <SectionTitle title="Localização" />
            <FairMap
              points={[
                {
                  id: fair.id,
                  slug: fair.slug,
                  name: fair.name,
                  city: fair.city,
                  latitude: fair.latitude,
                  longitude: fair.longitude,
                },
              ]}
              height="340px"
            />
          </section>
        ) : null}

        <ReviewsSection
          fairId={fair.id}
          reviews={fair.reviews}
          summary={summary}
          percentages={percentages}
          myReview={myReview}
          currentUserId={user?.id ?? null}
          canModerate={isAdmin}
        />

        <section>
          <Card className="p-6">
            <CommentSection
              fairId={fair.id}
              comments={comments}
              currentUserId={user?.id ?? null}
              canModerate={isAdmin}
            />
          </Card>
        </section>

        <FeedbackSection feedbacks={fair.feedbacks} fairId={fair.id} fairName={fair.name} user={user} />
      </div>

      <aside className="space-y-6">
        <ContactCard fair={fair} />
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-800">Organizador</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-500 text-sm font-bold text-white">
              {initials(fair.organizer.name)}
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">{fair.organizer.name}</p>
              <p className="text-xs text-ink-500">Organiza esta feirinha</p>
            </div>
          </div>
        </Card>

        {canPreview ? (
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800">Gerenciar</h3>
            <Link
              href={`/organizador/feirinhas/${fair.id}/editar`}
              className={buttonClass("outline", "sm", "mt-3 w-full")}
            >
              Editar feirinha
            </Link>
          </Card>
        ) : null}

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-ink-800">Algo errado?</h3>
          <p className="mt-1 text-xs text-ink-500">
            Ajude a manter a plataforma confiavel denunciando informações incorretas.
          </p>
          <ReportForm targetType="FAIR" targetId={fair.id} currentUserId={user?.id ?? null} />
        </Card>
      </aside>
    </div>
  );
}

export function OfferingsSection({ offerings }: { offerings: FairDetail["offerings"] }) {
  if (offerings.length === 0) return null;
  return (
    <section>
      <SectionTitle title="Produtos e serviços" subtitle="O que você encontra na feirinha" />
      <div className="grid gap-3 sm:grid-cols-2">
        {offerings.map((offering) => (
          <Card key={offering.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink-900">{offering.name}</h3>
              <Badge tone={offering.kind === "SERVICE" ? "info" : "brand"}>
                <Tag size={11} /> {offering.kind === "SERVICE" ? "Serviço" : "Produto"}
              </Badge>
            </div>
            {offering.description ? <p className="mt-1 text-sm text-ink-500">{offering.description}</p> : null}
            {offering.priceRange ? (
              <p className="mt-1 text-xs font-medium text-leaf-700">{offering.priceRange}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}

export interface EventInput {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  address: string | null;
  notes: string | null;
}

export function EventsSection({
  fairName,
  city,
  address,
  events,
}: {
  fairName: string;
  city: string;
  address: string;
  events: EventInput[];
}) {
  return (
    <section>
      <SectionTitle title="Agenda de eventos" subtitle="Datas em que a feirinha acontece" />
      {events.length === 0 ? (
        <Card className="p-6 text-sm text-ink-500">Nenhum evento agendado no momento.</Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-ink-900">{event.title}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-500">
                  <Calendar size={12} /> {formatDateTime(event.startsAt)}
                  {event.endsAt ? ` - ${formatDateTime(event.endsAt)}` : ""}
                </p>
                <p className="text-xs text-ink-400">{event.address ?? `${address}, ${city}`}</p>
              </div>
              <GoogleCalendarButton
                event={{
                  title: `${event.title} - ${fairName}`,
                  location: event.address ?? address,
                  start: event.startsAt,
                  end: event.endsAt ?? undefined,
                }}
              />
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

export function ReviewsSection({
  fairId,
  reviews,
  summary,
  percentages,
  myReview,
  currentUserId,
  canModerate,
}: {
  fairId: string;
  reviews: FairDetail["reviews"];
  summary: RatingSummary;
  percentages: Record<1 | 2 | 3 | 4 | 5, number>;
  myReview: { rating: number; title: string | null; content: string } | null;
  currentUserId: string | null;
  canModerate: boolean;
}) {
  return (
    <section id="avaliações" className="scroll-mt-20">
      <SectionTitle title="Avaliações" subtitle="O que as pessoas acharam da feirinha" />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-2">
          <div className="text-center">
            <p className="text-4xl font-bold text-ink-900">{summary.average.toFixed(1)}</p>
            <Stars value={summary.average} size={18} className="mt-1 justify-center" />
            <p className="mt-1 text-xs text-ink-500">{summary.count} avaliações</p>
          </div>
          <div className="mt-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2 text-xs text-ink-500">
                <span className="w-3">{star}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${percentages[star as 1 | 2 | 3 | 4 | 5]}%` }} />
                </div>
                <span className="w-8 text-right">{percentages[star as 1 | 2 | 3 | 4 | 5]}%</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {currentUserId ? (
            <Card className="p-5">
              <h3 className="mb-3 text-sm font-semibold text-ink-800">
                {myReview ? "Sua avaliação" : "Avalie esta feirinha"}
              </h3>
              <ReviewForm fairId={fairId} existing={myReview} />
            </Card>
          ) : (
            <Card className="p-5 text-sm text-ink-500">
              <Link href="/entrar" className="font-medium text-brand-600 hover:underline">
                Entre
              </Link>{" "}
              para avaliar esta feirinha.
            </Card>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {reviews.length === 0 ? (
          <Card className="p-6 text-sm text-ink-500">Ainda não há avaliações. Seja o primeiro!</Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                  {initials(review.author.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-800">{review.author.name}</span>
                    <Stars value={review.rating} size={13} />
                    <span className="text-xs text-ink-400">{formatDate(review.createdAt)}</span>
                  </div>
                  {review.title ? <p className="mt-1 font-medium text-ink-800">{review.title}</p> : null}
                  <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{review.content}</p>
                  {(currentUserId === review.authorId || canModerate) ? (
                    <form action={deleteReviewAction} className="mt-1">
                      <input type="hidden" name="reviewId" value={review.id} />
                      <button type="submit" className="text-xs text-ink-400 hover:text-red-600">
                        Excluir
                      </button>
                    </form>
                  ) : null}
                  <ReportForm targetType="REVIEW" targetId={review.id} currentUserId={currentUserId} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}

export function FeedbackSection({
  feedbacks,
  fairId,
  fairName,
  user,
}: {
  feedbacks: FairDetail["feedbacks"];
  fairId: string;
  fairName: string;
  user: SessionUser | null;
}) {
  const canSubmit = user?.role === "ORGANIZER" || user?.role === "ADMIN";
  const avgOrganization = averageOf(feedbacks.map((f) => f.organizationScore));
  const wouldReturn = feedbacks.filter((f) => f.wouldParticipateAgain).length;

  return (
    <section>
      <SectionTitle
        title="Feedback dos organizadores"
        subtitle="Experiências de quem já participou desta feirinha"
      />

      {feedbacks.length > 0 ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-leaf-700">{avgOrganization.toFixed(1)}</p>
            <p className="text-xs text-ink-500">nota média de organização</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-ink-900">{feedbacks.length}</p>
            <p className="text-xs text-ink-500">feedbacks recebidos</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-brand-500">{wouldReturn}</p>
            <p className="text-xs text-ink-500">participariam novamente</p>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink-800">
            <Lightbulb size={15} /> Compartilhe seu feedback
          </h3>
          <OrganizerFeedbackForm fairId={fairId} fairName={fairName} canSubmit={canSubmit} />
        </Card>

        <div className="space-y-3">
          {feedbacks.length === 0 ? (
            <Card className="p-6 text-sm text-ink-500">
              Ainda não há feedbacks de organizadores para esta feirinha.
            </Card>
          ) : (
            feedbacks.map((feedback) => (
              <Card key={feedback.id} className="p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf-600 text-xs font-bold text-white">
                    {initials(feedback.author.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-ink-800">{feedback.author.name}</span>
                      <Badge tone={feedback.wouldParticipateAgain ? "success" : "neutral"}>
                        {feedback.wouldParticipateAgain ? (
                          <>
                            <Check size={11} /> Participaria novamente
                          </>
                        ) : (
                          "Não participaria novamente"
                        )}
                      </Badge>
                      <span className="text-xs text-ink-400">
                        organização {feedback.organizationScore}/5 - {formatDate(feedback.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-sm text-ink-600">{feedback.experience}</p>
                    {feedback.suggestions ? (
                      <p className="mt-2 rounded-lg bg-ink-50 p-2 text-xs text-ink-600">
                        <strong>Sugestões:</strong> {feedback.suggestions}
                      </p>
                    ) : null}
                    <ReportForm targetType="FEEDBACK" targetId={feedback.id} currentUserId={user?.id ?? null} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export function ContactCard({ fair }: { fair: FairDetail }) {
  const items: { icon: React.ReactNode; label: string; value: string; href?: string }[] = [];
  if (fair.contactPhone) items.push({ icon: <Phone size={14} />, label: "Telefone", value: fair.contactPhone, href: `tel:${fair.contactPhone}` });
  if (fair.contactEmail) items.push({ icon: <Mail size={14} />, label: "E-mail", value: fair.contactEmail, href: `mailto:${fair.contactEmail}` });
  if (fair.websiteUrl) items.push({ icon: <Globe size={14} />, label: "Site", value: fair.websiteUrl, href: fair.websiteUrl });
  if (fair.instagramUrl) items.push({ icon: <Globe size={14} />, label: "Instagram", value: fair.instagramUrl });

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink-800">Informações de contato</h3>
      <div className="mt-3 space-y-3 text-sm">
        <p className="flex items-start gap-2 text-ink-600">
          <MapPin size={15} className="mt-0.5 shrink-0 text-brand-500" />
          <span>
            {fair.address}
            <br />
            {fair.city} - {fair.state}
            {fair.zipCode ? `, ${fair.zipCode}` : ""}
          </span>
        </p>
        {items.map((item, index) => (
          <p key={index} className="flex items-center gap-2 text-ink-600">
            <span className="text-brand-500">{item.icon}</span>
            {item.href ? (
              <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 hover:underline">
                {item.value}
              </a>
            ) : (
              <span>{item.value}</span>
            )}
          </p>
        ))}
        {items.length === 0 ? (
          <p className="text-xs text-ink-400">O organizador não informou canais de contato.</p>
        ) : null}
      </div>
    </Card>
  );
}