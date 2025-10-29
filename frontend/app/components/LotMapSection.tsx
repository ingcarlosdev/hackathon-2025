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
  rows: string[][];
  headers: string[];
  desiredDisplayHeaders: string[];
}

export default function LotMapSection({
  validation,
  lotes,
  selectedLot,
  onLotChange,
  rows,
  headers,
  desiredDisplayHeaders,
}: LotMapSectionProps) {
  // Puntos para el mapa por lote seleccionado, marcando inválidos
  const puntosSeleccionados = useMemo(() => {
    if (!selectedLot) return [];

    // Crear un set de filas que tienen errores (usando las filas originales del CSV, índice base 1)
    const filasConErrores = new Set<number>();
    const erroresPorFila = new Map<number, string[]>();
    
    if (validation?.errores) {
      validation.errores.forEach((err: any) => {
        if (err.fila) {
          filasConErrores.add(err.fila);
          if (!erroresPorFila.has(err.fila)) erroresPorFila.set(err.fila, []);
          erroresPorFila.get(err.fila)!.push(err.tipo);
        }
        if (err.filas && Array.isArray(err.filas)) {
          err.filas.forEach((f: number) => {
            filasConErrores.add(f);
            if (!erroresPorFila.has(f)) erroresPorFila.set(f, []);
            erroresPorFila.get(f)!.push(err.tipo);
          });
        }
      });
    }

    // Normalizar headers para mapeo
    const normalize = (s: string) =>
      (s || "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");

    const normToIndex: Record<string, number> = {};
    headers.forEach((h, i) => {
      normToIndex[normalize(h)] = i;
    });

    // Mapear columnas del CSV original a las deseadas
    const mapping: { desired: string; source: string }[] = [
      { desired: "Latitud", source: "latitud" },
      { desired: "Longitud", source: "longitud" },
      { desired: "Línea palma", source: "linea" },
      { desired: "Posición palma", source: "palma" },
      { desired: "Lote", source: "lote" },
    ];

    const latIdx = mapping.findIndex((m) => m.desired === "Latitud");
    const lonIdx = mapping.findIndex((m) => m.desired === "Longitud");
    const lineaIdx = mapping.findIndex((m) => m.desired === "Línea palma");
    const posIdx = mapping.findIndex((m) => m.desired === "Posición palma");
    const loteIdx = mapping.findIndex((m) => m.desired === "Lote");

    // Crear filas ordenadas para comparación
    const orderedRows = rows.map((r) =>
      mapping.map(({ source }) => {
        const idx = normToIndex[source];
        return idx !== undefined ? r[idx] : "";
      })
    );

    // Filtrar filas del lote seleccionado, manteniendo el índice original del CSV (base 1)
    const rowsWithIndex = orderedRows
      .map((orderedRow, idx) => ({ row: orderedRow, csvRowIndex: idx + 2 })) // +2: +1 por header, +1 porque CSV es base 1
      .filter(({ row }) => String(row[loteIdx]) === selectedLot);

    return rowsWithIndex
      .map(({ row, csvRowIndex }) => {
        const lat = Number(row[latIdx]);
        const lon = Number(row[lonIdx]);
        if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

        // Determinar tipo de error usando el índice de fila del CSV original
        const errores = erroresPorFila.get(csvRowIndex) || [];
        const tieneError = filasConErrores.has(csvRowIndex);
        
        let tipo: "valido" | "repetido" | "palma_repetida" | "fuera_rango" = "valido";
        if (errores.includes("coordenada_repetida")) tipo = "repetido";
        else if (errores.includes("posicion_repetida_en_linea") || errores.includes("linea_repetida_en_lote"))
          tipo = "palma_repetida";
        else if (errores.includes("coordenada_fuera_rango")) tipo = "fuera_rango";
        else if (tieneError && errores.length > 0) tipo = "repetido"; // fallback para otros errores

        return {
          id: `${selectedLot}-${row[lineaIdx] ?? ""}-${row[posIdx] ?? ""}-${csvRowIndex}`,
          lat,
          lon,
          linea: row[lineaIdx],
          palma: row[posIdx],
          tipo,
          mensaje: errores.length > 0 ? errores.join(", ") : undefined,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);
  }, [rows, headers, selectedLot, validation, desiredDisplayHeaders]);

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

