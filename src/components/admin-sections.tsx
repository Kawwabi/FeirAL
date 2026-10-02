import Link from "next/link";
import { Eye, MousePointerClick } from "lucide-react";
import { updateAdStatusAction } from "@/app/actions/ads";
import { AdStatusBadge } from "@/components/status-badge";
import { Card, buttonClass } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export interface AdItem {
  id: string;
  title: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  impressions: number;
  clicks: number;
  fair: { name: string; slug: string };
  owner: { name: string };
}

/** Lista administrativa de todos os anuncios com acoes de pausar/reativar. */
export function AllAdsSection({ ads }: { ads: AdItem[] }) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-ink-900">Todos os anuncios</h2>
      <Card className="overflow-hidden">
        <div className="divide-y divide-ink-100">
          {ads.map((ad) => (
            <div key={ad.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/feirinhas/${ad.fair.slug}`} className="font-medium text-ink-900 hover:text-brand-700">
                    {ad.title}
                  </Link>
                  <AdStatusBadge status={ad.status} />
                </div>
                <p className="text-xs text-ink-500">
                  {ad.fair.name} - {ad.owner.name} - {formatDate(ad.startsAt)} a {formatDate(ad.endsAt)}
                </p>
                <p className="inline-flex items-center gap-3 text-xs text-ink-400">
                  <span className="inline-flex items-center gap-1">
                    <Eye size={11} /> {ad.impressions.toLocaleString("pt-BR")}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MousePointerClick size={11} /> {ad.clicks.toLocaleString("pt-BR")}
                  </span>
                </p>
              </div>
              <div className="flex gap-2">
                {ad.status === "ACTIVE" ? (
                  <form action={updateAdStatusAction}>
                    <input type="hidden" name="adId" value={ad.id} />
                    <input type="hidden" name="status" value="PAUSED" />
                    <button type="submit" className={buttonClass("outline", "sm")}>
                      Pausar
                    </button>
                  </form>
                ) : ad.status === "PAUSED" ? (
                  <form action={updateAdStatusAction}>
                    <input type="hidden" name="adId" value={ad.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <button type="submit" className={buttonClass("success", "sm")}>
                      Reativar
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}