import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { ResetPasswordForm } from "@/components/forms";
import { Card } from "@/components/ui";
import { asString, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Redefinir senha" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  const token = asString(params.token) ?? "";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <KeyRound size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Definir nova senha</h1>
        <p className="mt-1 text-sm text-ink-500">Escolha uma nova senha para acessar sua conta.</p>
      </div>

      <Card className="p-6">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-sm text-red-600">
            Token ausente. Solicite um novo link em{" "}
            <Link href="/recuperar-senha" className="font-medium underline">
              recuperar senha
            </Link>
            .
          </p>
        )}
      </Card>
    </div>
  );
}