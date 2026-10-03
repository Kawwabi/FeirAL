"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Ticket, User, LayoutDashboard, Shield, LogOut, Bell } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { buttonClass } from "@/components/ui";
import type { SessionUser } from "@/lib/auth";

const NAV = [
  { href: "/feirinhas", label: "Feirinhas" },
  { href: "/mapa", label: "Mapa" },
  { href: "/agenda", label: "Agenda" },
  { href: "/categorias", label: "Categorias" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteHeader({
  user,
  unreadCount = 0,
}: {
  user: SessionUser | null;
  unreadCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white">
            <Ticket size={20} />
          </span>
          <span className="text-lg leading-none">
            Feir<span className="text-brand-500">AL</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-brand-50 text-brand-600"
                  : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <Link
                href="/perfil/notificacoes"
                className="relative rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100"
                aria-label="Notificações"
              >
                <Bell size={18} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Link>
              {user.role === "ADMIN" ? (
                <Link href="/admin" className={buttonClass("outline", "sm")}>
                  <Shield size={15} /> Admin
                </Link>
              ) : null}
              {user.role === "ORGANIZER" || user.role === "ADMIN" ? (
                <Link href="/organizador" className={buttonClass("outline", "sm")}>
                  <LayoutDashboard size={15} /> Painel
                </Link>
              ) : null}
              <Link href="/perfil" className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-ink-100">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-ink-900 text-xs font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="text-sm font-medium text-ink-700">{user.name.split(" ")[0]}</span>
              </Link>
              <form action="/api/logout" method="post">
                <button className={buttonClass("ghost", "sm")} type="submit" aria-label="Sair">
                  <LogOut size={15} />
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/entrar" className={buttonClass("ghost", "sm")}>
                Entrar
              </Link>
              <Link href="/cadastrar" className={buttonClass("primary", "sm")}>
                <User size={15} /> Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-ink-700 transition-colors hover:bg-ink-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <MobileNav open={open} close={() => setOpen(false)} isActive={isActive} user={user} />
    </header>
  );
}

function MobileNav({
  open,
  close,
  isActive,
  user,
}: {
  open: boolean;
  close: () => void;
  isActive: (href: string) => boolean;
  user: SessionUser | null;
}) {
  return (
    <div
      inert={!open}
      className={cn(
        "grid transition-all duration-200 ease-out md:hidden",
        open ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="overflow-hidden">
        <div className="border-t border-ink-200 bg-white px-4 py-3">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium",
                  isActive(item.href) ? "bg-brand-50 text-brand-600" : "text-ink-700",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-ink-200 pt-3">
            {user ? (
              <>
                <Link href="/perfil" onClick={close} className={buttonClass("outline", "sm")}>
                  <User size={15} /> Meu perfil
                </Link>
                {user.role === "ORGANIZER" || user.role === "ADMIN" ? (
                  <Link href="/organizador" onClick={close} className={buttonClass("outline", "sm")}>
                    <LayoutDashboard size={15} /> Painel do organizador
                  </Link>
                ) : null}
                {user.role === "ADMIN" ? (
                  <Link href="/admin" onClick={close} className={buttonClass("outline", "sm")}>
                    <Shield size={15} /> Administração
                  </Link>
                ) : null}
                <form action="/api/logout" method="post">
                  <button className={buttonClass("ghost", "sm", "w-full")} type="submit">
                    <LogOut size={15} /> Sair
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/entrar" onClick={close} className={buttonClass("outline", "sm")}>
                  Entrar
                </Link>
                <Link href="/cadastrar" onClick={close} className={buttonClass("primary", "sm")}>
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}