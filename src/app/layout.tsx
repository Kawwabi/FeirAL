import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { getCurrentUser } from "@/lib/auth";
import { countUnreadNotifications } from "@/lib/queries";

export const metadata: Metadata = {
  title: {
    default: "FeirAL - Feirinhas de Alagoas",
    template: "%s | FeirAL",
  },
  description:
    "Descubra, organize e divulgue as feirinhas de Alagoas: artesanato, alimentos, moda e eventos culturais em um so lugar.",
  keywords: ["feirinha", "Alagoas", "Maceio", "artesanato", "feira", "cultura", "agenda"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const unreadCount = user ? await countUnreadNotifications(user.id) : 0;

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <SiteHeader user={user} unreadCount={unreadCount} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <AiChatWidget userName={user?.name ?? null} />
      </body>
    </html>
  );
}