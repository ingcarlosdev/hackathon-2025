"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Polygon } from "react-leaflet";
import { useEffect, useMemo } from "react";
import { LatLngTuple, latLngBounds } from "leaflet";
import { useMap } from "react-leaflet";

type Punto = {
  id: string;
  lat: number;
  lon: number;
  linea?: string | number;
  palma?: string | number;
  tipo: "valido" | "repetido" | "palma_repetida" | "fuera_rango";
  mensaje?: string;
};

function FitToPoints({ puntos }: { puntos: Punto[] }) {
  const map = useMap();
  useEffect(() => {
    if (!puntos || puntos.length === 0) return;
    const bounds = latLngBounds(puntos.map((p) => [p.lat, p.lon] as LatLngTuple));
    // Usar flyToBounds para animación suave y centrado más consistente
    map.flyToBounds(bounds.pad(0.1), { duration: 1 });
    // Asegurar que el mapa se actualice después de cambios de tamaño
    setTimeout(() => map.invalidateSize(), 100);
  }, [map, puntos]);
  return null;
}

// Convex Hull (monotone chain) sobre [lat, lon]
function convexHullLatLng(points: LatLngTuple[]): LatLngTuple[] {
  if (points.length <= 3) return points;
  const pts = points
    .map((p) => ({ x: p[1], y: p[0] })) // trabajar como (x=lon, y=lat)
    .sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));

  const cross = (o: any, a: any, b: any) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: any[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: any[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop();
  lower.pop();
  const hull = lower.concat(upper);
  return hull.map((p) => [p.y, p.x] as LatLngTuple);
}

export default function MapaValidacion({ puntos }: { puntos: Punto[] }) {
  if (!puntos || puntos.length === 0)
    return <p className="text-center text-gray-500">No hay puntos para mostrar.</p>;

  const center: LatLngTuple = [puntos[0].lat, puntos[0].lon];

  // Agrupar por línea para dibujar polilíneas por posición
  const lineGroups = useMemo(() => {
    const map = new Map<string, Punto[]>();
    puntos.forEach((p) => {
      const key = String(p.linea ?? "");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    });
    // ordenar cada línea por 'palma'
    for (const arr of map.values()) {
      arr.sort((a, b) => Number(a.palma ?? 0) - Number(b.palma ?? 0));
    }
    return map;
  }, [puntos]);

  // Perímetro aproximado del lote con convex hull
  const hull = useMemo(() => convexHullLatLng(puntos.map((p) => [p.lat, p.lon] as LatLngTuple)), [puntos]);

  const colorForLine = (lineKey: string) => {
    const colors = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];
    const idx = Math.abs(hashCode(lineKey)) % colors.length;
    return colors[idx];
  };
  const hashCode = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return h;
  };

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow">
      <MapContainer center={center} zoom={14} className="h-full w-full">
        <FitToPoints puntos={puntos} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />

        {/* Perímetro del lote (convex hull) */}
        {hull.length >= 3 && (
          <Polygon positions={hull} pathOptions={{ color: "#0f766e", weight: 2, fillOpacity: 0.15 }} />
        )}

        {/* Líneas por número de línea */}
        {Array.from(lineGroups.entries()).map(([lineKey, pts]) => (
          <Polyline
            key={`line-${lineKey}`}
            positions={pts.map((p) => [p.lat, p.lon] as LatLngTuple)}
            pathOptions={{ color: colorForLine(lineKey), weight: 2 }}
          />
        ))}

        {/* Puntos individuales como circle markers con colores según validez */}
        {puntos.map((p) => {
          let color = "#22c55e"; // verde para válidos
          if (p.tipo === "repetido") color = "#ef4444"; // rojo para coordenadas repetidas
          else if (p.tipo === "palma_repetida") color = "#f59e0b"; // naranja para palmas repetidas
          else if (p.tipo === "fuera_rango") color = "#6366f1"; // índigo para fuera de rango

          return (
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lon]}
              radius={p.tipo === "valido" ? 4 : 5}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.8, weight: p.tipo !== "valido" ? 2 : 1 }}
            >
              <Popup>
                <div>
                  <b>Línea:</b> {String(p.linea ?? "")}<br />
                  <b>Posición:</b> {String(p.palma ?? "")}<br />
                  <b>Estado:</b> <span style={{ color }}>{p.tipo === "valido" ? "Válido" : p.tipo}</span>
                  {p.mensaje && (
                    <>
                      <br />
                      <b>Error:</b> {p.mensaje}
                    </>
                  )}
                  <br />
                  <b>Lat:</b> {p.lat.toFixed(6)} | <b>Lon:</b> {p.lon.toFixed(6)}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
