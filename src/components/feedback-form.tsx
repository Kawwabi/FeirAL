"use client";

import { useActionState } from "react";
import { Lightbulb, Loader2, Check } from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/community";
import { initialActionState } from "@/lib/action-state";
import { fieldClass } from "@/components/ui";

/** Área de feedback dos organizadores sobre a participação em uma feirinha. */
export function OrganizerFeedbackForm({
  fairId,
  fairName,
  canSubmit,
}: {
  fairId: string;
  fairName: string;
  canSubmit: boolean;
}) {
  const [state, formAction, pending] = useActionState(submitFeedbackAction, initialActionState);

  if (!canSubmit) {
    return (
      <p className="rounded-lg border border-dashed border-ink-300 bg-ink-50 px-4 py-3 text-sm text-ink-500">
        A área de feedback é destinada a organizadores. Crie uma conta de organizador para compartilhar
        sua experiência nesta feirinha.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="fairId" value={fairId} />

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-700">
          Como foi sua experiência em {fairName}? <span className="text-brand-500">*</span>
        </span>
        <textarea
          name="experience"
          required
          rows={3}
          placeholder="Conte sobre fluxo de visitantes, estrutura, apoio da organização..."
          className={fieldClass}
        />
        {state.errors?.experience ? (
          <p className="mt-1 text-xs text-red-600">{state.errors.experience}</p>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-ink-700">Sugestões de melhoria</span>
        <textarea
          name="suggestions"
          rows={2}
          placeholder="O que poderia melhorar?"
          className={`${fieldClass} min-h-0`}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink-700">Nota de organização (1-5)</span>
          <select name="organizationScore" defaultValue="5" className={fieldClass}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 pb-2 text-sm text-ink-700">
          <input type="checkbox" name="wouldParticipateAgain" defaultChecked className="h-4 w-4 rounded" />
          Participaria novamente
        </label>
      </div>

      {state.message ? (
        <p className={state.ok ? "text-sm font-medium text-leaf-700" : "text-sm text-red-600"}>
          {state.ok ? <Check size={14} className="mr-1 inline" /> : null}
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-leaf-600 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-700 disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Lightbulb size={15} />}
        Enviar feedback
      </button>
    </form>
  );
}