import type { SpotData, ParsedCSVResult } from "./types/spot"

/**
 * Parsea el contenido de un archivo CSV y lo convierte en un array de SpotData
 * @param csvContent - Contenido del archivo CSV como string
 * @returns Resultado del parseo con datos y errores
 */
export function parseCSV(csvContent: string): ParsedCSVResult {
  const errors: string[] = []
  const data: SpotData[] = []

  // Dividir el contenido en líneas
  const lines = csvContent.split("\n").filter((line) => line.trim() !== "")

  if (lines.length === 0) {
    return {
      success: false,
      data: [],
      errors: ["El archivo CSV está vacío"],
      totalRows: 0,
    }
  }

  // Obtener los headers (primera línea)
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())

  // Validar que existan las columnas requeridas
  const requiredColumns = ["latitud", "longitud", "línea palma", "posición palma", "lote"]
  const missingColumns = requiredColumns.filter(
    (col) => !headers.some((h) => h.includes(col.toLowerCase().replace("ó", "o").replace("í", "i"))),
  )

  if (missingColumns.length > 0) {
    return {
      success: false,
      data: [],
      errors: [`Columnas faltantes: ${missingColumns.join(", ")}`],
      totalRows: lines.length - 1,
    }
  }

  // Encontrar índices de las columnas
  const latitudIndex = headers.findIndex((h) => h.includes("latitud"))
  const longitudIndex = headers.findIndex((h) => h.includes("longitud"))
  const lineaPalmaIndex = headers.findIndex((h) => h.includes("linea") || h.includes("línea"))
  const posicionPalmaIndex = headers.findIndex((h) => h.includes("posicion") || h.includes("posición"))
  const loteIndex = headers.findIndex((h) => h.includes("lote"))

  // Procesar cada fila de datos (saltando el header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(",").map((v) => v.trim())
    const rowNumber = i + 1

    try {
      // Parsear latitud
      const latitud = Number.parseFloat(values[latitudIndex])
      if (isNaN(latitud)) {
        errors.push(`Fila ${rowNumber}: Latitud inválida`)
        continue
      }

      // Parsear longitud
      const longitud = Number.parseFloat(values[longitudIndex])
      if (isNaN(longitud)) {
        errors.push(`Fila ${rowNumber}: Longitud inválida`)
        continue
      }

      // Parsear línea palma
      const lineaPalma = Number.parseInt(values[lineaPalmaIndex])
      if (isNaN(lineaPalma)) {
        errors.push(`Fila ${rowNumber}: Línea palma inválida`)
        continue
      }

      // Parsear posición palma
      const posicionPalma = Number.parseInt(values[posicionPalmaIndex])
      if (isNaN(posicionPalma)) {
        errors.push(`Fila ${rowNumber}: Posición palma inválida`)
        continue
      }

      // Obtener lote (puede ser string o número)
      const loteValue = values[loteIndex]
      const lote = isNaN(Number(loteValue)) ? loteValue : Number(loteValue)

      // Agregar el spot parseado
      data.push({
        latitud,
        longitud,
        lineaPalma,
        posicionPalma,
        lote,
      })
    } catch (error) {
      errors.push(
        `Fila ${rowNumber}: Error al procesar - ${error instanceof Error ? error.message : "Error desconocido"}`,
      )
    }
  }

  return {
    success: errors.length === 0 && data.length > 0,
    data,
    errors,
    totalRows: lines.length - 1,
  }
}

/**
 * Lee un archivo File y retorna su contenido como string
 * @param file - Archivo a leer
 * @returns Promise con el contenido del archivo
 */
export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      const content = event.target?.result as string
      resolve(content)
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    reader.readAsText(file)
  })
}
