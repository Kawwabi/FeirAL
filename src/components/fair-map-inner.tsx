"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import Link from "next/link";

export interface MapPoint {
  id: string;
  slug: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  color?: string | null;
  rating?: number;
}

const ALAGOAS_CENTER: [number, number] = [-9.6658, -35.7353];

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);
  return null;
}

export default function FairMapInner({
  points,
  height = "70vh",
  interactive = true,
}: {
  points: MapPoint[];
  height?: string;
  interactive?: boolean;
}) {
  const bounds = points.map((p) => [p.latitude, p.longitude] as [number, number]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-2xl border border-ink-200">
      <MapContainer
        center={bounds[0] ?? ALAGOAS_CENTER}
        zoom={points.length ? 12 : 9}
        scrollWheelZoom={interactive}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={bounds} />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.latitude, p.longitude]}
            radius={10}
            pathOptions={{
              color: "white",
              weight: 2,
              fillColor: p.color ?? "#ea580c",
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="min-w-40">
                <Link href={`/feirinhas/${p.slug}`} className="text-sm font-semibold text-brand-700">
                  {p.name}
                </Link>
                <p className="mt-0.5 text-xs text-ink-500">{p.city} - AL</p>
                {p.rating ? <p className="text-xs text-amber-600">Nota {p.rating.toFixed(1)}</p> : null}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}