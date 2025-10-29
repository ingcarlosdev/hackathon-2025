"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const MapaValidacion = dynamic(() => import("@/app/components/MapaValidacion"), {
  ssr: false,
});

interface LotMapSectionProps {
  validation: any;
  lotes: string[];
  selectedLot: string;
  onLotChange: (lote: string) => void;
  displayRows: string[][];
  desiredDisplayHeaders: string[];
}

export default function LotMapSection({
  validation,
  lotes,
  selectedLot,
  onLotChange,
  displayRows,
  desiredDisplayHeaders,
}: LotMapSectionProps) {
  // Puntos para el mapa por lote seleccionado, marcando inválidos
  const puntosSeleccionados = useMemo(() => {
    if (!selectedLot) return [];

    // Crear un mapa de filas que tienen errores
    const erroresPorFila = new Map<number, string[]>();
    if (validation?.errores) {
      validation.errores.forEach((err: any) => {
        if (err.fila) {
          if (!erroresPorFila.has(err.fila)) erroresPorFila.set(err.fila, []);
          erroresPorFila.get(err.fila)!.push(err.tipo);
        }
        if (err.filas && Array.isArray(err.filas)) {
          err.filas.forEach((f: number) => {
            if (!erroresPorFila.has(f)) erroresPorFila.set(f, []);
            erroresPorFila.get(f)!.push(err.tipo);
          });
        }
      });
    }

    const latIdx = desiredDisplayHeaders.indexOf("Latitud");
    const lonIdx = desiredDisplayHeaders.indexOf("Longitud");
    const lineaIdx = desiredDisplayHeaders.indexOf("Línea palma");
    const posIdx = desiredDisplayHeaders.indexOf("Posición palma");
    const loteIdx = desiredDisplayHeaders.indexOf("Lote");

    // Filtrar filas del lote y calcular índice real en el CSV original
    const rowsWithIndex = displayRows
      .map((r, idx) => ({ row: r, displayIdx: idx + 1 }))
      .filter(({ row }) => String(row[loteIdx]) === selectedLot);

    return rowsWithIndex
      .map(({ row, displayIdx }) => {
        const lat = Number(row[latIdx]);
        const lon = Number(row[lonIdx]);
        if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

        // Determinar tipo de error
        const errores = erroresPorFila.get(displayIdx) || [];
        let tipo: "valido" | "repetido" | "palma_repetida" | "fuera_rango" = "valido";
        if (errores.includes("coordenada_repetida")) tipo = "repetido";
        else if (errores.includes("posicion_repetida_en_linea") || errores.includes("linea_repetida_en_lote"))
          tipo = "palma_repetida";
        else if (errores.includes("coordenada_fuera_rango")) tipo = "fuera_rango";
        else if (errores.length > 0) tipo = "repetido"; // fallback

        return {
          id: `${selectedLot}-${row[lineaIdx] ?? ""}-${row[posIdx] ?? ""}-${displayIdx}`,
          lat,
          lon,
          linea: row[lineaIdx],
          palma: row[posIdx],
          tipo,
          mensaje: errores.length > 0 ? errores.join(", ") : undefined,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [displayRows, selectedLot, validation, desiredDisplayHeaders]);

  if (!validation || lotes.length === 0) return null;

  return (
    <section className="w-full max-w-4xl">
      <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
        <div className="px-5 py-3 border-b bg-[#aa0f16]/5 flex items-center gap-4">
          <h2 className="text-[#aa0f16] font-semibold flex-1">Previsualización por lote</h2>
          <select
            value={selectedLot}
            onChange={(e) => onLotChange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">Selecciona un lote…</option>
            {lotes.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="p-5">
          {!selectedLot && (
            <p className="text-sm text-gray-600">Selecciona un lote para ver sus puntos en el mapa.</p>
          )}
          {selectedLot && (
            <MapaValidacion puntos={puntosSeleccionados as any} />
          )}
        </div>
      </div>
    </section>
  );
}

