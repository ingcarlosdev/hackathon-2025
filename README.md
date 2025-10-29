# Excel to API CSV Reader

Un proyecto full-stack que permite subir archivos Excel y CSV, procesarlos y convertirlos en una API REST.

## Estructura del Proyecto

```
├── frontend/          # Aplicación Next.js 14
├── backend/           # API FastAPI con Python
└── README.md          # Este archivo
```

## Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework de React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS
- **ESLint** - Linter de código

### Backend
- **FastAPI** - Framework web moderno y rápido para Python
- **Pandas** - Manipulación y análisis de datos
- **Uvicorn** - Servidor ASGI
- **Python 3.8+** - Lenguaje de programación

## Instalación y Configuración

### Backend (Python)

1. Navegar al directorio backend:
   ```bash
   cd backend
   ```

2. Crear entorno virtual:
   ```bash
   python -m venv venv
   ```

3. Activar entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Instalar dependencias:
   ```bash
   pip install -r requirements.txt
   ```

5. Ejecutar el servidor:
   ```bash
   python main.py
   ```

El backend estará disponible en: `http://localhost:8000`

### Frontend (Next.js)

1. Navegar al directorio frontend:
   ```bash
   cd frontend
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

El frontend estará disponible en: `http://localhost:3000`

## API Endpoints

### Backend Endpoints

- `GET /` - Mensaje de bienvenida
- `GET /health` - Verificación de salud del servidor
- `POST /upload-csv` - Subir y procesar archivos CSV
- `POST /upload-excel` - Subir y procesar archivos Excel

### Documentación de la API

Una vez que el backend esté ejecutándose, puedes acceder a la documentación interactiva en:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Características

- ✅ Subida de archivos CSV y Excel
- ✅ Procesamiento de datos con Pandas
- ✅ API REST con FastAPI
- ✅ Frontend con Next.js 14 y App Router
- ✅ Interfaz moderna con Tailwind CSS
- ✅ CORS configurado para comunicación frontend-backend
- ✅ Manejo de errores robusto

## Desarrollo

Para desarrollo simultáneo:

1. Ejecutar el backend en una terminal:
   ```bash
   cd backend
   python main.py
   ```

2. Ejecutar el frontend en otra terminal:
   ```bash
   cd frontend
   npm run dev
   ```

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
"# hackathon-2025" 
