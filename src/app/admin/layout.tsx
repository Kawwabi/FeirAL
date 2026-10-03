import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";
import { Badge } from "@/components/ui";

const NAV = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/feirinhas", label: "Feirinhas e moderação" },
  { href: "/admin/denuncias", label: "Denúncias" },
  { href: "/admin/anuncios", label: "Anúncios" },
  { href: "/admin/usuarios", label: "Usuários" },
  { href: "/admin/atividade", label: "Atividade" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.role !== "ADMIN") redirect("/perfil");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-2">
        <h1 className="text-xl font-bold text-ink-900">Administração</h1>
        <Badge tone="danger">acesso restrito</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside>
          <DashboardNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}