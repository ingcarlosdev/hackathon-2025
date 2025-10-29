"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  selectedFinca: string;
  selectedLote: string;
}

export default function FileUploader({ selectedFinca, selectedLote }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) return alert("Selecciona un archivo primero");
    if (!selectedFinca || !selectedLote)
      return alert("Selecciona finca y lote antes de subir el archivo");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fincaId", selectedFinca);
    formData.append("loteId", selectedLote);

    const res = await fetch("http://127.0.0.1:8000/validar-csv/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log(data);
    alert("Archivo procesado correctamente. Revisa la consola.");
  };

  return (
    <div className="mt-20 bg-[#ffffff] flex flex-col">
      {/* Contenido */}
      <div className="flex flex-col items-center justify-center flex-1 p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
            isDragging
              ? "border-[#aa0f16] bg-[#aa0f16]/10"
              : "border-[#aa0f16] bg-[#aa0f16]/5"
          }`}
        >
          <p className="text-gray-700 text-lg mb-2 font-medium">
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
            className="cursor-pointer text-[#aa0f16] underline font-semibold hover:text-red-700"
          >
            Seleccionar archivo
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!file}
          className={`mt-8 px-8 py-3 rounded-lg font-semibold text-white transition-all shadow-md ${
            file
              ? "bg-[#aa0f16] hover:bg-red-800 cursor-pointer"
              : "bg-gray-400 disabled:cursor-not-allowed"
          }`}
        >
          Validar CSV
        </button>
      </div>
    </div>
  );
}
