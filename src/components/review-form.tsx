"use client";

import { useActionState, useState } from "react";
import { Star, Loader2, Check } from "lucide-react";
import { upsertReviewAction } from "@/app/actions/community";
import { initialActionState } from "@/lib/action-state";
import { fieldClass } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ReviewForm({
  fairId,
  existing,
}: {
  fairId: string;
  existing?: { rating: number; title: string | null; content: string } | null;
}) {
  const [state, formAction, pending] = useActionState(upsertReviewAction, initialActionState);
  const [rating, setRating] = useState(existing?.rating ?? 0);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="fairId" value={fairId} />
      <input type="hidden" name="rating" value={rating} />

      <div>
        <span className="mb-1 block text-sm font-medium text-ink-700">Sua nota</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} estrelas`}
              className="rounded p-0.5"
            >
              <Star
                size={26}
                className={value <= rating ? "text-amber-400" : "text-ink-300"}
                fill={value <= rating ? "currentColor" : "none"}
              />
            </button>
          ))}
          {rating > 0 ? <span className="ml-2 text-sm text-ink-500">{rating} de 5</span> : null}
        </div>
        {state.errors?.rating ? <p className="mt-1 text-xs text-red-600">{state.errors.rating}</p> : null}
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-700">Título (opcional)</span>
        <input
          name="title"
          defaultValue={existing?.title ?? ""}
          placeholder="Resuma sua experiência"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-700">
          Comentário <span className="text-brand-500">*</span>
        </span>
        <textarea
          name="content"
          defaultValue={existing?.content ?? ""}
          required
          minLength={5}
          rows={4}
          placeholder="O que você achou da feirinha? Conte sobre produtos, organização e ambiente."
          className={cn(fieldClass, "min-h-24")}
        />
        {state.errors?.content ? <p className="mt-1 text-xs text-red-600">{state.errors.content}</p> : null}
      </label>

      <label className="block sm:max-w-56">
        <span className="mb-1 block text-sm font-medium text-ink-700">Quando você visitou?</span>
        <input type="date" name="visitedAt" className={fieldClass} />
      </label>

      {state.message ? (
        <p className={state.ok ? "text-sm font-medium text-leaf-700" : "text-sm text-red-600"}>
          {state.ok ? <Check size={14} className="mr-1 inline" /> : null}
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
        {existing ? "Atualizar avaliação" : "Publicar avaliação"}
      </button>
    </form>
  );
}