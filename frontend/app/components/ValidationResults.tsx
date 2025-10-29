interface ValidationResultsProps {
  validation: any;
  apiError: string | null;
}

export default function ValidationResults({ validation, apiError }: ValidationResultsProps) {
  if (!validation && !apiError) return null;

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
                    {validation.errores.map((err: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-800 rounded border border-red-200 bg-red-50 p-3">
                        <span className="font-medium text-[#aa0f16] mr-2">
                          {tipoLabels[err.tipo] || err.tipo}:
                        </span>
                        {err.descripcion}
                      </li>
                    ))}
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
  );
}

