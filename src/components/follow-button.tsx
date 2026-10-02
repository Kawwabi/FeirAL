import Link from "next/link";
import { Heart, HeartOff, Star } from "lucide-react";
import { toggleFollowAction } from "@/app/actions/account";

/** Botao de acompanhar feirinha (seguir). Renderizado no servidor, sem JS no cliente. */
export function FollowButton({
  fairId,
  slug,
  isFollowing,
  isLoggedIn,
}: {
  fairId: string;
  slug: string;
  isFollowing: boolean;
  isLoggedIn: boolean;
}) {
  if (!isLoggedIn) {
    return (
      <Link
        href="/entrar"
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
      >
        <Heart size={16} /> Entrar para acompanhar
      </Link>
    );
  }

  return (
    <form action={toggleFollowAction}>
      <input type="hidden" name="fairId" value={fairId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className={
          isFollowing
            ? "inline-flex items-center justify-center gap-2 rounded-lg border border-leaf-500 bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700"
            : "inline-flex items-center justify-center gap-2 rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50"
        }
      >
        {isFollowing ? <HeartOff size={16} /> : <Heart size={16} />}
        {isFollowing ? "Acompanhando" : "Acompanhar feirinha"}
      </button>
    </form>
  );
}

export function RatingInline({ average, count }: { average: number; count: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm text-ink-600">
      <Star size={14} className="text-amber-400" fill="currentColor" />
      <strong className="font-semibold text-ink-800">{average.toFixed(1)}</strong>
      <span className="text-ink-400">({count} avaliacoes)</span>
    </span>
  );
}