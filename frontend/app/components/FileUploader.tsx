"use client";

import { useMemo, useState, useEffect } from "react";
import Header from "@/app/components/Header";
import FileDropzone from "@/app/components/FileDropzone";
import CsvPreview from "@/app/components/CsvPreview";
import ValidationResults from "@/app/components/ValidationResults";
import LotMapSection from "@/app/components/LotMapSection";
import FincaLoteSelector from "@/app/components/FincaLoteSelector"; // 👈 importa el selector

export default function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [setFileText] = useState<string>("");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [displayHeaders, setDisplayHeaders] = useState<string[]>([]);
  const [displayRows, setDisplayRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedLot, setSelectedLot] = useState<string>("");

  // 👇 Nuevo estado para finca/lote seleccionados desde el selector
  const [selectedFincaId, setSelectedFincaId] = useState<string>("");
  const [selectedLoteId, setSelectedLoteId] = useState<string>("");

  // Callback que recibe selección desde FincaLoteSelector
  const handleFincaLoteChange = (fincaId: string, loteId: string) => {
    setSelectedFincaId(fincaId);
    setSelectedLoteId(loteId);
  };

  // --- Manejo de archivo CSV ---
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
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
    return { headers, rows };
  };

  // --- Llamada al backend para validar ---
  const validateWithBackend = async (fileToValidate: File) => {
    setLoading(true);
    setApiError(null);
    setValidation(null);
    try {
      const formData = new FormData();
      formData.append("file", fileToValidate);

      // 👇 Incluimos finca y lote seleccionados en el formData
      if (selectedFincaId) formData.append("finca_id", selectedFincaId);
      if (selectedLoteId) formData.append("lote_id", selectedLoteId);

      const res = await fetch("http://127.0.0.1:8000/validar-csv/", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

      const data = await res.json();
      setValidation(data);
    } catch (e: any) {
      setApiError(
        `Error al conectar con el backend: ${e.message || "Error desconocido"}`
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const desiredDisplayHeaders = [
    "Latitud",
    "Longitud",
    "Línea palma",
    "Posición palma",
    "Lote",
  ];

  const canSendToSioma = !!file && !loading && validation && Array.isArray(validation.errores) && validation.errores.length === 0 && selectedFincaId && selectedLoteId;

  const sendToSioma = async () => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (selectedFincaId) formData.append("finca_id", selectedFincaId);
      if (selectedLoteId) formData.append("lote_id", selectedLoteId);
      const res = await fetch("http://127.0.0.1:8000/sioma/enviar", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      alert(data.message || "Enviado a Sioma exitosamente");
    } catch (e: any) {
      alert(e.message || "No se pudo enviar a Sioma");
    }
  };

  const normalize = (s: string) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const reorderForDisplay = (csvHeaders: string[], csvRows: string[][]) => {
    const normToIndex: Record<string, number> = {};
    csvHeaders.forEach((h, i) => {
      normToIndex[normalize(h)] = i;
    });

    const mapping = [
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

  const lotes = useMemo(() => {
    const loteIdx = desiredDisplayHeaders.findIndex((h) => h === "Lote");
    const set = new Set<string>();
    displayRows.forEach((r) => {
      const v = r[loteIdx];
      if (v) set.add(String(v));
    });
    return Array.from(set);
  }, [displayRows]);

  useEffect(() => {
    if (file) validateWithBackend(file);
  }, [file]);

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      <Header />

      <main className="flex flex-col gap-6 items-center flex-1 p-6">
        {/* 👇 Agregamos el selector de finca y lote arriba del uploader */}
        <FincaLoteSelector onSelectionChange={handleFincaLoteChange} />

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
          onSendToSioma={sendToSioma}
          canSend={!!canSendToSioma}
        />

        {file && (
          <CsvPreview
            headers={displayHeaders}
            rows={displayRows}
            totalRows={displayRows.length}
          />
        )}

        <ValidationResults validation={validation} apiError={apiError} />

        <LotMapSection
          validation={validation}
          lotes={lotes}
          selectedLot={selectedLot}
          onLotChange={setSelectedLot}
          rows={rows}
          headers={headers}
          desiredDisplayHeaders={desiredDisplayHeaders}
        />
      </main>
    </div>
  );
}
