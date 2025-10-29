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


  // Validación automática cuando se carga el archivo
  useEffect(() => {
    if (file) {
      validateWithBackend(file);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <Header />

      <main className="flex flex-col gap-6 items-center flex-1 p-6">
        <FileDropzone
          file={file}
          isDragging={isDragging}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onValidate={() => file && validateWithBackend(file)}
          loading={loading}
          validation={validation}
        />

        {file && (
          <CsvPreview headers={displayHeaders} rows={displayRows} totalRows={displayRows.length} />
        )}

        <ValidationResults validation={validation} apiError={apiError} />

        <LotMapSection
          validation={validation}
          lotes={lotes}
          selectedLot={selectedLot}
          onLotChange={setSelectedLot}
          displayRows={displayRows}
          desiredDisplayHeaders={desiredDisplayHeaders}
        />
      </main>
    </div>
  );
}
