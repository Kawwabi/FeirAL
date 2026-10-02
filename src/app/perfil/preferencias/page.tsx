import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PreferencesForm } from "@/components/forms";
import { Card, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Preferencias de notificacao" };

export default async function PreferencesPage() {
  const user = await requireUser();
  const [pref, categories] = await Promise.all([
    prisma.notificationPreference.findUnique({ where: { userId: user.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Minha conta"
        title="Preferencias de notificacao"
        description="Escolha como e quando voce quer ser avisado sobre as feirinhas."
      />

      <Card className="p-6">
        <PreferencesForm
          preferences={{
            emailEnabled: pref?.emailEnabled ?? true,
            pushEnabled: pref?.pushEnabled ?? false,
            newEvents: pref?.newEvents ?? true,
            reviewReplies: pref?.reviewReplies ?? true,
            weeklyDigest: pref?.weeklyDigest ?? false,
            preferredCity: pref?.preferredCity ?? null,
            preferredCategories: pref?.preferredCategories ?? "",
          }}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
        />
      </Card>
    </div>
  );
}