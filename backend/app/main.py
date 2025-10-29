# app/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.validators import validar_csv  # 👈 tu función personalizada

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


# 💾 Endpoint para validar CSV
@app.post("/validar-csv/")
async def validar_csv_endpoint(file: UploadFile = File(...)):
    try:
        resultado = validar_csv(file.file)
        return resultado
    except Exception as e:
        return {"status": "error", "message": str(e)}
