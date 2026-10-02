import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

const NAV = [
  { href: "/perfil", label: "Meu perfil" },
  { href: "/perfil/favoritos", label: "Acompanho" },
  { href: "/perfil/avaliacoes", label: "Avaliacoes" },
  { href: "/perfil/notificacoes", label: "Notificacoes" },
  { href: "/perfil/preferencias", label: "Preferencias" },
];

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <DashboardNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}