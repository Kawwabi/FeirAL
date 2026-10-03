import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { DashboardNav } from "@/components/dashboard-nav";

const NAV = [
  { href: "/organizador", label: "Painel" },
  { href: "/organizador/feirinhas", label: "Minhas feirinhas" },
  { href: "/organizador/feirinhas/nova", label: "Nova feirinha" },
  { href: "/organizador/anuncios", label: "Anúncios" },
  { href: "/organizador/feedback", label: "Feedbacks" },
];

export default async function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") redirect("/perfil");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
        <aside>
          <DashboardNav items={NAV} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}