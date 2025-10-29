"use client";

import { useState, useEffect } from "react";

interface Finca {
  key_value: number;
  nombre: string;
}

interface Lote {
  key_value: number;
  nombre: string;
}

interface Props {
  onSelectionChange: (fincaId: string, loteId: string) => void;
}

export default function FincaLoteSelector({ onSelectionChange }: Props) {
  const [fincas, setFincas] = useState<Finca[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [selectedFinca, setSelectedFinca] = useState<string>("");
  const [selectedLote, setSelectedLote] = useState<string>("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/fincas/")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") setFincas(data.fincas);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedFinca) return; // no hacer nada si no hay finca

    const fetchLotes = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/lotes/${selectedFinca}`);
        const data = await res.json();
        if (data.status === "ok") setLotes(data.lotes);
      } catch (err) {
        console.error(err);
        setLotes([]);
      }
    };

    fetchLotes();
  }, [selectedFinca]);

  // Limpiar lotes de manera segura fuera del efecto
  const handleFincaChange = (fincaId: string) => {
    setSelectedFinca(fincaId);
    if (!fincaId) {
      setLotes([]);
      setSelectedLote("");
    }
  };

  useEffect(() => {
    onSelectionChange(selectedFinca, selectedLote);
  }, [selectedFinca, selectedLote, onSelectionChange]);

  return (
    <div className="w-full max-w-lg flex flex-col gap-6">
      {/* Dropdown Finca */}
      <div>
        <label className="block mb-1 font-semibold text-[#aa0f16]">
          Selecciona finca
        </label>
        <select
          value={selectedFinca}
          onChange={(e) => handleFincaChange(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">Selecciona una finca</option>
          {fincas.map((f) => (
            <option key={f.key_value} value={f.key_value}>
              {f.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown Lote */}
      <div>
        <label className="block mb-1 font-semibold text-[#aa0f16]">
          Selecciona lote
        </label>
        <select
          value={selectedLote}
          onChange={(e) => setSelectedLote(e.target.value)}
          disabled={!selectedFinca}
          className="w-full p-3 rounded-lg border-2 border-[#aa0f16] focus:outline-none focus:ring-2 focus:ring-[#aa0f16] disabled:bg-gray-100 disabled:text-gray-400"
        >
          <option value="">-- Selecciona lote --</option>
          {lotes.map((l) => (
            <option key={l.key_value} value={l.key_value}>
              {l.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
