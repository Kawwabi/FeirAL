"use client";

import { useActionState } from "react";
import { Flag, Loader2, Check } from "lucide-react";
import { createReportAction } from "@/app/actions/community";
import { initialActionState } from "@/lib/action-state";
import { REPORT_REASONS } from "@/lib/constants";
import { fieldClass } from "@/components/ui";

/** Formulario de denuncia reutilizavel (feirinha, avaliacao, comentario, feedback). */
export function ReportForm({
  targetType,
  targetId,
  currentUserId,
}: {
  targetType: string;
  targetId: string;
  currentUserId: string | null;
}) {
  const [state, formAction, pending] = useActionState(createReportAction, initialActionState);

  if (!currentUserId) return null;

  return (
    <details className="mt-2">
      <summary className="inline-flex cursor-pointer items-center gap-1 text-xs text-ink-400 hover:text-red-600">
        <Flag size={12} /> Denunciar
      </summary>
      <form action={formAction} className="mt-2 space-y-2 rounded-lg border border-ink-200 bg-ink-50 p-3">
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <select name="reason" required className={fieldClass} defaultValue="">
          <option value="" disabled>
            Selecione o motivo
          </option>
          {REPORT_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
        <textarea name="details" rows={2} placeholder="Detalhes (opcional)" className={`${fieldClass} min-h-0`} />
        {state.message ? (
          <p className={state.ok ? "text-xs font-medium text-leaf-700" : "text-xs text-red-600"}>
            {state.ok ? <Check size={12} className="mr-1 inline" /> : null}
            {state.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Flag size={13} />}
          Enviar denuncia
        </button>
      </form>
    </details>
  );
}