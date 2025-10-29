# app/main.py
import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.validators import validar_csv  # 👈 tu función personalizada
import httpx

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
            data = res.json()
        return {"status": "ok", "fincas": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/lotes/{finca_id}")
async def get_lotes(finca_id: str):
    try:
        headers = {
            "Authorization": f"{SIOMA_API_KEY}",
            "Content-Type": "application/json",
            "tipo-sujetos": "[3]"
        }
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{SIOMA_API_BASE}/4/usuarios/sujetos/{finca_id}", headers=headers)
            res.raise_for_status()
            data = res.json()
        return {"status": "ok", "lotes": data}
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
    

