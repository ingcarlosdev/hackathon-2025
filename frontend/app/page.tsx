"use client";

import { useState } from "react";
import FileUploader from "@/app/components/FileUploader";
import FincaLoteSelector from "@/app/components/FincaLoteSelector";
import Header from "./components/Header";

export default function Home() {
  const [selectedFinca, setSelectedFinca] = useState("");
  const [selectedLote, setSelectedLote] = useState("");

  // Callback que pasa el FincaLoteSelector
  const handleSelectionChange = (fincaId: string, loteId: string) => {
    setSelectedFinca(fincaId);
    setSelectedLote(loteId);
  };

  return (
    <main className="flex flex-col items-center justify-start flex-1 mt-0 gap-8 w-full">
      <Header />

      {/* Selector de finca y lote */}
      <FincaLoteSelector onSelectionChange={handleSelectionChange} />

      {/* Render condicional del FileUploader */}
      {selectedFinca && selectedLote && (
        <FileUploader selectedFinca={selectedFinca} selectedLote={selectedLote} />
      )}
    </main>
  );
}
