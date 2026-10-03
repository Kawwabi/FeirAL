"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Loader2,
  LogIn,
  UserPlus,
  KeyRound,
  Check,
} from "lucide-react";
import {
  loginAction,
  registerAction,
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/auth";
import { updateProfileAction, updatePreferencesAction } from "@/app/actions/account";
import { createAdAction } from "@/app/actions/ads";
import { initialActionState } from "@/lib/action-state";
import { fieldClass, Field } from "@/components/ui";
import { AD_TIER_INFO } from "@/lib/constants";
import { formatBRL } from "@/lib/utils";

function SubmitFeedback({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) return null;
  return (
    <p className={ok ? "text-sm font-medium text-leaf-700" : "text-sm text-red-600"}>
      {ok ? <Check size={14} className="mr-1 inline" /> : null}
      {message}
    </p>
  );
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.ok ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      ) : null}

      <Field label="E-mail" required error={state.errors?.email}>
        <input name="email" type="email" required autoComplete="email" className={fieldClass} />
      </Field>
      <Field label="Senha" required error={state.errors?.password}>
        <input name="password" type="password" required autoComplete="current-password" className={fieldClass} />
      </Field>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
        Entrar
      </button>

      <div className="flex justify-between text-sm">
        <Link href="/recuperar-senha" className="text-ink-500 hover:text-brand-600">
          Esqueci minha senha
        </Link>
        <Link href="/cadastrar" className="font-medium text-brand-600 hover:underline">
          Criar conta
        </Link>
      </div>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.ok ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.message}</p>
      ) : null}

      <Field label="Nome completo" required error={state.errors?.name}>
        <input name="name" required autoComplete="name" className={fieldClass} />
      </Field>
      <Field label="E-mail" required error={state.errors?.email}>
        <input name="email" type="email" required autoComplete="email" className={fieldClass} />
      </Field>
      <Field label="Senha" required error={state.errors?.password} hint="Mínimo de 6 caracteres.">
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className={fieldClass} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cidade">
          <input name="city" className={fieldClass} placeholder="Ex.: Maceió" />
        </Field>
        <Field label="Tipo de conta">
          <select name="role" defaultValue="VISITOR" className={fieldClass}>
            <option value="VISITOR">Visitante</option>
            <option value="ORGANIZER">Organizador de feirinhas</option>
          </select>
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
        Criar conta
      </button>

      <p className="text-center text-sm text-ink-500">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function RequestResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <Field label="E-mail cadastrado" required error={state.errors?.email}>
        <input name="email" type="email" required className={fieldClass} />
      </Field>
      <SubmitFeedback ok={state.ok} message={state.message} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        Gerar link de recuperação
      </button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <Field label="Nova senha" required error={state.errors?.password} hint="Mínimo de 6 caracteres.">
        <input name="password" type="password" required minLength={6} className={fieldClass} />
      </Field>
      <SubmitFeedback ok={state.ok} message={state.message} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
        Redefinir senha
      </button>
    </form>
  );
}

/* ------------------------- Conta e perfil ------------------------- */

export function ProfileForm({
  user,
}: {
  user: { name: string; city: string | null; bio: string | null; avatarUrl: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      <SubmitFeedback ok={state.ok} message={state.message} />
      <Field label="Nome" required error={state.errors?.name}>
        <input name="name" defaultValue={user.name} required className={fieldClass} />
      </Field>
      <Field label="Cidade">
        <input name="city" defaultValue={user.city ?? ""} className={fieldClass} />
      </Field>
      <Field label="Bio" hint="Uma breve descrição que aparece no seu perfil.">
        <textarea name="bio" defaultValue={user.bio ?? ""} rows={3} className={`${fieldClass} min-h-0`} />
      </Field>
      <Field label="URL do avatar" hint="Opcional.">
        <input name="avatarUrl" defaultValue={user.avatarUrl ?? ""} className={fieldClass} />
      </Field>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Salvar perfil
      </button>
    </form>
  );
}

export function PreferencesForm({
  preferences,
  categories,
}: {
  preferences: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    newEvents: boolean;
    reviewReplies: boolean;
    weeklyDigest: boolean;
    preferredCity: string | null;
    preferredCategories: string;
  };
  categories: { slug: string; name: string; icon: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(updatePreferencesAction, initialActionState);
  const selected = preferences.preferredCategories.split(",").filter(Boolean);

  const toggles = [
    { name: "emailEnabled", label: "Notificações por e-mail", hint: "Receber novidades por e-mail.", checked: preferences.emailEnabled },
    { name: "pushEnabled", label: "Notificações no navegador", hint: "Alertas em tempo real.", checked: preferences.pushEnabled },
    { name: "newEvents", label: "Novos eventos das feirinhas que acompanho", hint: "Avisamos quando surgirem novas datas.", checked: preferences.newEvents },
    { name: "reviewReplies", label: "Respostas e avaliações", hint: "Quando alguém interagir com suas contribuições.", checked: preferences.reviewReplies },
    { name: "weeklyDigest", label: "Resumo semanal", hint: "Um e-mail por semana com destaques.", checked: preferences.weeklyDigest },
  ];

  return (
    <form action={formAction} className="space-y-5">
      <SubmitFeedback ok={state.ok} message={state.message} />

      <div className="space-y-3">
        {toggles.map((toggle) => (
          <label key={toggle.name} className="flex items-start gap-3 rounded-lg border border-ink-200 p-3">
            <input
              type="checkbox"
              name={toggle.name}
              defaultChecked={toggle.checked}
              className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500"
            />
            <span>
              <span className="block text-sm font-medium text-ink-800">{toggle.label}</span>
              <span className="block text-xs text-ink-500">{toggle.hint}</span>
            </span>
          </label>
        ))}
      </div>

      <Field label="Cidade preferida" hint="Usamos para sugerir feirinhas próximas.">
        <input name="preferredCity" defaultValue={preferences.preferredCity ?? ""} className={fieldClass} />
      </Field>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-700">Categorias de interesse</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <label
              key={cat.slug}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 has-checked:border-brand-400 has-checked:bg-brand-50"
            >
              <input
                type="checkbox"
                name="preferredCategories"
                value={cat.slug}
                defaultChecked={selected.includes(cat.slug)}
                className="h-3.5 w-3.5 rounded border-ink-300 text-brand-500"
              />
              {cat.icon ? `${cat.icon} ` : ""}
              {cat.name}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Salvar preferências
      </button>
    </form>
  );
}

export function AdForm({ fairs }: { fairs: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createAdAction, initialActionState);

  return (
    <form action={formAction} className="space-y-4">
      {state.message ? (
        <p
          className={
            state.ok
              ? "rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800"
              : "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.message}
        </p>
      ) : null}

      <Field label="Feirinha" required error={state.errors?.fairId}>
        <select name="fairId" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Selecione uma feirinha
          </option>
          {fairs.map((fair) => (
            <option key={fair.id} value={fair.id}>
              {fair.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Título do anúncio" required error={state.errors?.title}>
        <input name="title" required className={fieldClass} placeholder="Ex.: Sábado tem feira na Pajuçara!" />
      </Field>

      <Field label="Descrição">
        <textarea name="description" rows={2} className={`${fieldClass} min-h-0`} />
      </Field>

      <Field label="Imagem do anúncio (URL)">
        <input name="imageUrl" className={fieldClass} placeholder="https://..." />
      </Field>

      <Field label="Plano" required>
        <select name="tier" defaultValue="BASIC" className={fieldClass}>
          {Object.entries(AD_TIER_INFO).map(([key, info]) => (
            <option key={key} value={key}>
              {info.label} - {formatBRL(info.priceCents)}/dia ({info.impressionsPerDay.toLocaleString("pt-BR")}{" "}
              impressões/dia)
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Início" required>
          <input name="startsAt" type="date" required className={fieldClass} />
        </Field>
        <Field label="Término" required>
          <input name="endsAt" type="date" required className={fieldClass} />
        </Field>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
      >
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
        Enviar anúncio para aprovação
      </button>
    </form>
  );
}