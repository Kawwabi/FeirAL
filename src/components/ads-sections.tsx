import { AD_TIER_INFO } from "@/lib/constants";
import { updateAdStatusAction } from "@/app/actions/ads";
import { AdStatusBadge } from "@/components/status-badge";
import { Card, buttonClass } from "@/components/ui";
import { formatBRL, formatDate } from "@/lib/utils";

/** Cartão com os planos de anúncio disponíveis. */
export function AdPlansCard() {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-ink-800">Planos disponíveis</h3>
      <div className="mt-3 space-y-3">
        {Object.entries(AD_TIER_INFO).map(([key, info]) => (
          <div key={key} className="rounded-lg border border-ink-200 p-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-medium text-ink-900">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: info.color }} />
                {info.label}
              </span>
              <span className="text-sm font-semibold text-brand-600">{formatBRL(info.priceCents)}/dia</span>
            </div>
            <p className="mt-1 text-xs text-ink-500">
              {info.impressionsPerDay.toLocaleString("pt-BR")} impressões/dia
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink-500">
              {info.perks.map((perk) => (
                <li key={perk}>- {perk}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

export interface AdRow {
  id: string;
  title: string;
  status: string;
  tier: string;
  startsAt: Date;
  endsAt: Date;
  impressions: number;
  clicks: number;
  fairName: string;
}

/** Lista de anúncios do organizador com ações de pausar/ativar. */
export function MyAdsList({ ads }: { ads: AdRow[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-ink-100 p-5">
        <h2 className="text-base font-semibold text-ink-900">Meus anúncios</h2>
      </div>
      {ads.length === 0 ? (
        <p className="p-8 text-center text-sm text-ink-500">Nenhum anúncio criado ainda.</p>
      ) : (
        <div className="divide-y divide-ink-100">
          {ads.map((ad) => (
            <div key={ad.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-ink-900">{ad.title}</p>
                  <AdStatusBadge status={ad.status} />
                  <span className="text-xs text-ink-500">{AD_TIER_INFO[ad.tier]?.label ?? ad.tier}</span>
                </div>
                <p className="text-xs text-ink-500">
                  {ad.fairName} - {formatDate(ad.startsAt)} a {formatDate(ad.endsAt)}
                </p>
                <p className="text-xs text-ink-400">
                  {ad.impressions.toLocaleString("pt-BR")} impressões - {ad.clicks.toLocaleString("pt-BR")} cliques
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
                      Ativar
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}