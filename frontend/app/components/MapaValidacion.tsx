"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { LatLngTuple } from "leaflet";

const centro: LatLngTuple = [6.155, -75.35];


interface Punto {
  id: string;
  lat: number;
  lon: number;
  tipo: "valido" | "repetido" | "palma_repetida" | "fuera_rango";
  mensaje?: string;
}

// 🟢🟤🔴⚫ Íconos personalizados
const iconos = {
  valido: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [32, 32],
  }),
  repetido: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [32, 32],
  }),
  palma_repetida: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/brown-dot.png",
    iconSize: [32, 32],
  }),
  fuera_rango: new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/black-dot.png",
    iconSize: [32, 32],
  }),
};

export default function MapaValidacion({ puntos }: { puntos: Punto[] }) {
  if (!puntos || puntos.length === 0)
    return <p className="text-center text-gray-500">No hay puntos para mostrar.</p>;

  // const centro = [puntos[0].lat, puntos[0].lon];

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow">
      <MapContainer center={centro} zoom={13} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        {puntos.map((p, i) => (
          <Marker key={i} position={[p.lat, p.lon]} icon={iconos[p.tipo]}>
            <Popup>
              <b>ID:</b> {p.id}
              <br />
              <b>Tipo:</b> {p.tipo}
              <br />
              {p.mensaje && <span>{p.mensaje}</span>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
