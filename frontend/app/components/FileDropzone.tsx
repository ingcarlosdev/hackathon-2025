interface FileDropzoneProps {
  file: File | null;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onValidate: () => void;
  loading: boolean;
  validation: any;
}

export default function FileDropzone({
  file,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onValidate,
  loading,
  validation,
}: FileDropzoneProps) {
  return (
    <section className="w-full max-w-4xl">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
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
          onChange={onFileChange}
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
          onClick={onValidate}
          disabled={!file || loading}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors shadow ${
            !file || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#aa0f16] hover:bg-red-800"
          }`}
        >
          {loading ? "Validando..." : "Validar datos"}
        </button>
        <button
          onClick={() => {}}
          disabled={!file || loading || (validation?.errores?.length ?? 0) > 0}
          className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors shadow ${
            !file || loading || (validation?.errores?.length ?? 0) > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          title="Enviar datos validados a Sioma (requiere finca_id y lote_id)"
        >
          Enviar a Sioma
        </button>
      </div>
      {loading && (
        <div className="mt-4 text-center text-gray-600">
          <p>Validando archivo...</p>
        </div>
      )}
    </section>
  );
}

