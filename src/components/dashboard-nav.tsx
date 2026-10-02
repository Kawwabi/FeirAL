"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

/** Navegacao lateral reutilizada nas areas de visitante, organizador e administrador. */
export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1.5 lg:flex-col lg:overflow-visible">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-brand-600 text-white" : "text-ink-600 hover:bg-ink-100",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}