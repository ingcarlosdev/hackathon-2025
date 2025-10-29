# app/main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.validators import validar_csv  # 👈 tu función personalizada
import httpx
import logging
from dotenv import load_dotenv

load_dotenv()  # carga variables del .env
logging.basicConfig(level=logging.INFO)

# ⚙️ Inicializar la aplicación FastAPI
app = FastAPI(title="Geo-Validador API", version="1.0")

# 🔐 Configuración CORS
origins = [
    "http://localhost:3000",  # Frontend local (Next.js)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SIOMA_API_BASE = os.getenv("SIOMA_API_BASE")
SIOMA_API_KEY = os.getenv("SIOMA_API_KEY")

# 🔹 Endpoint para obtener todas las fincas
@app.get("/fincas/")
async def get_fincas():
    try:
        headers = {
            "Authorization": f"{SIOMA_API_KEY}",
            "Content-Type": "application/json",
            "tipo-sujetos": "[1]"
        }
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{SIOMA_API_BASE}/4/usuarios/sujetos", headers=headers)
            res.raise_for_status()
            data = res.json()  # Esto está bien, no requiere await aquí
        logging.info(f"Fincas recibidas: {data}")
        return {"status": "ok", "fincas": data}
    except httpx.RequestError as e:
        logging.error(f"Error de request: {e}")
        return {"status": "error", "message": str(e)}
    except httpx.HTTPStatusError as e:
        logging.error(f"Error HTTP: {e.response.status_code} - {e.response.text}")
        return {"status": "error", "message": str(e)}

@app.get("/lotes/{finca_id}")
async def get_lotes(finca_id: str):
    """
    Devuelve solo los lotes que pertenecen a la finca seleccionada.
    Se obtiene toda la lista de lotes desde la API de Sioma y se filtra por finca_id.
    """
    try:
        headers = {
            "Authorization": f"{SIOMA_API_KEY}",
            "Content-Type": "application/json",
            "tipo-sujetos": "[3]"  # Lotes
        }
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{SIOMA_API_BASE}/4/usuarios/sujetos", headers=headers)
            res.raise_for_status()
            all_lotes = res.json()

        # Filtrar lotes por finca_id
        lotes_filtrados = [lote for lote in all_lotes if str(lote.get("finca_id")) == str(finca_id)]

        return {"status": "ok", "lotes": lotes_filtrados}

    except Exception as e:
        return {"status": "error", "message": str(e)}




# 💾 Endpoint para validar CSV
@app.post("/validar-csv/")
async def validar_csv_endpoint(file: UploadFile = File(...)):
    try:
        resultado = validar_csv(file.file)
        return resultado
    except Exception as e:
        return {"status": "error", "message": str(e)}
    

