import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { RequestResetForm } from "@/components/forms";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Recuperar senha" };

export default function RequestResetPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Recuperar senha</h1>
        <p className="mt-1 text-sm text-ink-500">
          Informe seu e-mail e geraremos um link para criar uma nova senha.
        </p>
      </div>

      <Card className="p-6">
        <RequestResetForm />
        <p className="mt-4 text-xs text-ink-400">
          Em ambiente de demonstracao nao enviamos e-mails: o link de recuperacao aparece na tela.
        </p>
      </Card>

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link href="/entrar" className="font-medium text-brand-700 hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}