import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui";

export const metadata: Metadata = { title: "Criar conta" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/perfil");

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-600 text-white">
          <Ticket size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Crie sua conta no FeirAL</h1>
        <p className="mt-1 text-sm text-ink-500">
          Acompanhe feirinhas, avalie, comente e receba novidades. Organizadores podem cadastrar feirinhas.
        </p>
      </div>

      <Card className="p-6">
        <RegisterForm />
      </Card>
    </div>
  );
}