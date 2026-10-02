// Tipo compartilhado para o retorno das Server Actions usadas com useActionState.
export interface ActionState {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

export const initialActionState: ActionState = { ok: false };

/** Converte um erro de validacao Zod em um mapa de mensagens por campo. */
export function fieldErrors(issues: { path: (string | number | symbol)[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}