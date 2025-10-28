import { type NextRequest, NextResponse } from "next/server"
import { parseCSV } from "@/lib/csv-parser"

/**
 * API Route para procesar archivos CSV de spots
 * POST /api/upload-csv
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener el FormData del request
    const formData = await request.formData()
    const file = formData.get("file") as File

    // Validar que se haya enviado un archivo
    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar que sea un archivo CSV
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "El archivo debe ser un CSV" }, { status: 400 })
    }

    // Leer el contenido del archivo
    const content = await file.text()

    // Parsear el CSV
    const result = parseCSV(content)

    // Retornar el resultado
    return NextResponse.json({
      success: result.success,
      data: result.data,
      errors: result.errors,
      totalRows: result.totalRows,
      parsedRows: result.data.length,
      message: result.success
        ? `Se procesaron ${result.data.length} spots correctamente`
        : `Se encontraron ${result.errors.length} errores al procesar el archivo`,
    })
  } catch (error) {
    console.error("Error al procesar el archivo CSV:", error)
    return NextResponse.json(
      {
        error: "Error interno al procesar el archivo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
