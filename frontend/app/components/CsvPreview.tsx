interface CsvPreviewProps {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

export default function CsvPreview({ headers, rows, totalRows }: CsvPreviewProps) {
  const previewRows = rows.slice(0, 10);

  return (
    <section className="w-full max-w-4xl bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 bg-[#aa0f16]/5">
        <h2 className="text-[#aa0f16] font-semibold">Vista previa (primeras 10 filas)</h2>
      </div>
      {headers.length === 0 ? (
        <div className="p-5 text-gray-600">No se detectaron encabezados.</div>
      ) : (
        <div className="w-full overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="text-left px-3 py-2 font-semibold text-gray-700 border-b">
                    {h || "(vacío)"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewRows.map((r, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-3 py-2 text-gray-800 border-b">
                      {r[ci] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
              {previewRows.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-gray-600" colSpan={headers.length}>
                    Sin filas para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <div className="px-5 py-3 text-xs text-gray-500 border-t">
        Total de filas detectadas: {totalRows}
      </div>
    </section>
  );
}

