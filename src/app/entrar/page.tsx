import type { Metadata } from "next";
import Link from "next/link";
import { Ticket } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";
import { asString, type RawSearchParams } from "@/lib/search-params";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect("/perfil");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <Ticket size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-ink-500">Entre para acompanhar feirinhas, avaliar e comentar.</p>
      </div>

      <Card className="p-6">
        {asString(params.redefinido) ? (
          <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            Senha redefinida com sucesso. Faca login com a nova senha.
          </p>
        ) : null}
        <LoginForm />
      </Card>

      <p className="mt-6 text-center text-xs text-ink-400">
        Ao entrar, voce concorda com as boas praticas de convivencia da plataforma.{" "}
        <Link href="/sobre" className="text-brand-700 hover:underline">
          Saiba mais
        </Link>
      </p>
    </div>
  );
}