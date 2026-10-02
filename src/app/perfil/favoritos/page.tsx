import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getUserFollows } from "@/lib/queries";
import { requireUser } from "@/lib/auth";
import { coverImage } from "@/lib/utils";
import { toggleFollowAction } from "@/app/actions/account";
import { Card, EmptyState, PageHeader, buttonClass } from "@/components/ui";

export const metadata: Metadata = { title: "Feirinhas que acompanho" };

export default async function FavoritesPage() {
  const user = await requireUser();
  const follows = await getUserFollows(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minha conta"
        title="Feirinhas que acompanho"
        description="Voce recebe notificacoes quando novas datas forem anunciadas."
      />

      {follows.length === 0 ? (
        <EmptyState
          icon={<Heart size={28} />}
          title="Voce ainda nao acompanha nenhuma feirinha"
          description="Explore as feirinhas e clique em 'Acompanhar' para receber novidades."
          action={
            <Link href="/feirinhas" className={buttonClass("primary")}>
              Explorar feirinhas
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {follows.map((follow) => (
            <Card key={follow.id} className="flex flex-wrap items-center gap-4 p-4">
              <Link
                href={`/feirinhas/${follow.fair.slug}`}
                className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-ink-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage(follow.fair.coverImageUrl)}
                  alt={follow.fair.name}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/feirinhas/${follow.fair.slug}`}
                  className="font-semibold text-ink-900 hover:text-brand-700"
                >
                  {follow.fair.name}
                </Link>
                <p className="text-xs text-ink-500">{follow.fair.city} - AL</p>
              </div>
              <form action={toggleFollowAction}>
                <input type="hidden" name="fairId" value={follow.fair.id} />
                <input type="hidden" name="slug" value={follow.fair.slug} />
                <button type="submit" className={buttonClass("outline", "sm")}>
                  Deixar de acompanhar
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}