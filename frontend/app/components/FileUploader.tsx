"use client";

import { useMemo, useState, useEffect } from "react";
import Header from "@/app/components/Header";
import FileDropzone from "@/app/components/FileDropzone";
import CsvPreview from "@/app/components/CsvPreview";
import ValidationResults from "@/app/components/ValidationResults";
import LotMapSection from "@/app/components/LotMapSection";

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileText, setFileText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [displayHeaders, setDisplayHeaders] = useState<string[]>([]);
  const [displayRows, setDisplayRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string>("");

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      readAndParseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      readAndParseFile(e.target.files[0]);
    }
  };

  const readAndParseFile = (selected: File) => {
    setFile(selected);
    setValidation(null);
    setApiError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = (reader.result as string) || "";
      setFileText(text);
      const { headers: h, rows: r } = parseCsv(text);
      setHeaders(h);
      setRows(r);
      const { orderedHeaders, orderedRows } = reorderForDisplay(h, r);
      setDisplayHeaders(orderedHeaders);
      setDisplayRows(orderedRows);
    };
    reader.readAsText(selected, "utf-8");
  };

  const parseCsv = (text: string): { headers: string[]; rows: string[][] } => {
    // Simple CSV parser for comma-separated values without quoted commas
    const lines = text
      .split(/\r?\n/)
      .filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
    return { headers, rows };
  };

  const validateWithBackend = async (fileToValidate: File) => {
    setLoading(true);
    setApiError(null);
    setValidation(null);
    try {
      const formData = new FormData();
      formData.append("file", fileToValidate);
      const res = await fetch("http://127.0.0.1:8000/validar-csv/", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setValidation(data);
    } catch (e: any) {
      const errorMessage = e?.message || "Error al conectarse con el backend";
      setApiError(`No se pudo conectar con el backend. Asegúrate de que esté corriendo en http://127.0.0.1:8000. Error: ${errorMessage}`);
      console.error("Error de validación:", e);
    } finally {
      setLoading(false);
    }
  };

  const previewRows = useMemo(() => displayRows.slice(0, 10), [displayRows]);

  // Orden y nombres deseados para la visualización
  const desiredDisplayHeaders = [
    "Latitud",
    "Longitud",
    "Línea palma",
    "Posición palma",
    "Lote",
  ];

  const normalize = (s: string) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  // Reordenar filas para que coincidan con la estructura deseada
  const reorderForDisplay = (
    csvHeaders: string[],
    csvRows: string[][]
  ): { orderedHeaders: string[]; orderedRows: string[][] } => {
    const normToIndex: Record<string, number> = {};
    csvHeaders.forEach((h, i) => {
      normToIndex[normalize(h)] = i;
    });

    // Mapa de columnas del CSV -> nombres deseados
    const mapping: { desired: string; source: string }[] = [
      { desired: "Latitud", source: "latitud" },
      { desired: "Longitud", source: "longitud" },
      { desired: "Línea palma", source: "linea" },
      { desired: "Posición palma", source: "palma" },
      { desired: "Lote", source: "lote" },
    ];

    const orderedHeaders = desiredDisplayHeaders;
    const orderedRows = csvRows.map((r) =>
      mapping.map(({ source }) => {
        const idx = normToIndex[source];
        return idx !== undefined ? r[idx] : "";
      })
    );

    return { orderedHeaders, orderedRows };
  };

  // Lotes detectados desde el CSV cargado
  const lotes = useMemo(() => {
    const loteIdx = desiredDisplayHeaders.findIndex((h) => h === "Lote");
    const set = new Set<string>();
    displayRows.forEach((r) => {
      const v = r[loteIdx];
      if (v) set.add(String(v));
    });
    return Array.from(set);
  }, [displayRows]);

  // Puntos para el mapa por lote seleccionado
  const puntosSeleccionados = useMemo(() => {
    if (!selectedLot) return [] as { id: string; lat: number; lon: number; tipo: "valido" }[];
    const latIdx = desiredDisplayHeaders.indexOf("Latitud");
    const lonIdx = desiredDisplayHeaders.indexOf("Longitud");
    const lineaIdx = desiredDisplayHeaders.indexOf("Línea palma");
    const posIdx = desiredDisplayHeaders.indexOf("Posición palma");
    const loteIdx = desiredDisplayHeaders.indexOf("Lote");
    return displayRows
      .filter((r) => String(r[loteIdx]) === selectedLot)
      .map((r, i) => ({
        id: `${selectedLot}-${r[lineaIdx] ?? ""}-${r[posIdx] ?? ""}-${i}`,
        lat: Number(r[latIdx]),
        lon: Number(r[lonIdx]),
        linea: r[lineaIdx],
        palma: r[posIdx],
        tipo: "valido" as const,
      }))
      .filter((p) => !Number.isNaN(p.lat) && !Number.isNaN(p.lon));
  }, [displayRows, selectedLot]);

  // Validación automática cuando se carga el archivo
  useEffect(() => {
    if (file) {
      validateWithBackend(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {/* Header */}
      <header className="bg-[#aa0f16] py-4 px-6 flex items-center gap-4 shadow-md">
        <Image src="/sioma-logo.png" alt="Sioma Logo" width={171} height={171} />
        <h1 className="text-white text-3xl font-semibold tracking-wide">
          PALMAS CHECKER
        </h1>
      </header>

      {/* Contenido */}
      <main className="flex flex-col gap-6 items-center flex-1 p-6">
        <section className="w-full max-w-4xl">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`w-full border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              isDragging
                ? "border-[#aa0f16] bg-[#aa0f16]/10"
                : "border-[#aa0f16] bg-[#aa0f16]/5"
            }`}
          >
            <p className="text-gray-700 text-base mb-2 font-medium">
              {file ? file.name : "Arrastra o selecciona un archivo CSV"}
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="cursor-pointer inline-block mt-2 px-5 py-2 rounded-lg bg-white text-[#aa0f16] border border-[#aa0f16] font-semibold hover:bg-[#aa0f16] hover:text-white transition-colors"
            >
              Seleccionar archivo
            </label>
          </div>
          <div className="flex items-center justify-end gap-3 mt-4">
            <button
              onClick={() => file && validateWithBackend(file)}
              disabled={!file || loading}
              className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors shadow ${
                !file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#aa0f16] hover:bg-red-800"
              }`}
            >
              {loading ? "Validando..." : "Validar datos"}
            </button>
          </div>
          {loading && (
            <div className="mt-4 text-center text-gray-600">
              <p>Validando archivo...</p>
            </div>
          )}
        </section>

        {/* Vista previa */}
        {file && (
          <section className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 bg-[#aa0f16]/5">
              <h2 className="text-[#aa0f16] font-semibold">Vista previa (primeras 10 filas)</h2>
            </div>
            {displayHeaders.length === 0 ? (
              <div className="p-5 text-gray-600">No se detectaron encabezados.</div>
            ) : (
              <div className="w-full overflow-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {displayHeaders.map((h, i) => (
                        <th key={i} className="text-left px-3 py-2 font-semibold text-gray-700 border-b">
                          {h || "(vacío)"}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((r, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        {displayHeaders.map((_, ci) => (
                          <td key={ci} className="px-3 py-2 text-gray-800 border-b">
                            {r[ci] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {previewRows.length === 0 && (
                      <tr>
                        <td className="px-3 py-4 text-gray-600" colSpan={displayHeaders.length}>
                          Sin filas para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 text-xs text-gray-500 border-t">
              Total de filas detectadas: {displayRows.length}
            </div>
          </section>
        )}

        {/* Resultados de validación del backend */}
        <section className="w-full max-w-4xl">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4">
              {apiError}
            </div>
          )}
          {validation && (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              <div className="px-5 py-3 border-b bg-[#aa0f16]/5">
                <h2 className="text-[#aa0f16] font-semibold">Resultados de validación</h2>
              </div>
              {validation.status !== "ok" ? (
                <div className="p-5 text-gray-700">
                  {validation.message || "Se produjo un error en la validación."}
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 text-amber-700 px-3 py-1 border border-amber-200">
                      Errores: {validation.errores?.length ?? 0}
                    </span>
                  </div>

                  {/* Lista de errores */}
                  {Array.isArray(validation.errores) && validation.errores.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Errores encontrados</h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Estas son las <strong>inconsistencias detectadas</strong> en el archivo que necesitan atención:
                      </p>
                      <ul className="space-y-2 max-h-96 overflow-y-auto">
                        {validation.errores.map((err: any, idx: number) => {
                          const tipoLabels: Record<string, string> = {
                            dato_faltante: "Dato faltante",
                            dato_invalido: "Dato inválido",
                            coordenada_repetida: "Coordenada repetida",
                            linea_repetida_en_lote: "Línea repetida en lote",
                            posicion_repetida_en_linea: "Posición repetida en línea",
                            coordenada_fuera_rango: "Coordenada fuera de rango",
                            lote_invalido: "Lote inválido",
                          };
                          return (
                            <li key={idx} className="text-sm text-gray-800 rounded border border-red-200 bg-red-50 p-3">
                              <span className="font-medium text-[#aa0f16] mr-2">
                                {tipoLabels[err.tipo] || err.tipo}:
                              </span>
                              {err.descripcion}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  {Array.isArray(validation.errores) && validation.errores.length === 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                      <strong>✓ No se encontraron errores.</strong> Todas las coordenadas pasaron las validaciones.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* Previsualización por lote (basada en CSV local; no depende de API) */}
        {validation && lotes.length > 0 && (
          <section className="w-full max-w-4xl">
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
              <div className="px-5 py-3 border-b bg-[#aa0f16]/5 flex items-center gap-4">
                <h2 className="text-[#aa0f16] font-semibold flex-1">Previsualización por lote</h2>
                <select
                  value={selectedLot}
                  onChange={(e) => setSelectedLot(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Selecciona un lote…</option>
                  {lotes.map((l) => (
                    <option key={l} value={l}>{l}</option>
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
        )}
      </main>
    </div>
  );
}
