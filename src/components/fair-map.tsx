"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "@/components/fair-map-inner";

// O Leaflet acessa APIs do navegador, por isso carregamos o mapa apenas no cliente.
const FairMapInner = dynamic(() => import("@/components/fair-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[70vh] place-items-center rounded-2xl border border-ink-200 bg-ink-50 text-sm text-ink-500">
      Carregando mapa...
    </div>
  ),
});

export function FairMap(props: { points: MapPoint[]; height?: string; interactive?: boolean }) {
  return <FairMapInner {...props} />;
}

export type { MapPoint };