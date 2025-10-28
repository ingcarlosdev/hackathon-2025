/**
 * Representa un spot (palma) con su información georreferenciada
 */
export interface SpotData {
  latitud: number
  longitud: number
  lineaPalma: number
  posicionPalma: number
  lote: string | number
}

/**
 * Resultado del parseo del CSV
 */
export interface ParsedCSVResult {
  success: boolean
  data: SpotData[]
  errors: string[]
  totalRows: number
}
