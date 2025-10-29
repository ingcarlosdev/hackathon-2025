interface Coordenada {
  lote: string;
  linea: number;
  palma: number;
  longitud: number;
  latitud: number;
  estado: string;
}

interface ErrorFila {
  fila: number;
  descripcion: string;
}

interface ValidationResult {
  status: string;
  coordenadas: Coordenada[];
  errores: ErrorFila[];
}