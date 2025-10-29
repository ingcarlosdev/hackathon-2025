# SIOMA PALMAS CHECKER

Aplicación web diseñada para optimizar la gestión de productores de palma, ofreciendo una experiencia intuitiva, rápida y fiable. Su objetivo es brindar herramientas prácticas que permitan realizar tareas completas, tales como: carga y validación de datos, visualización clara en el mapa y acceso detallado a la información de plantas, lotes y fincas, buscando maximizar resultados. 

**CARACTERISTICAS**: ---------------------------------------------------------------------------------------------------------------------------------------
- Carga y validación de archivos: consistiendo en un proceso seguro para importar datos de campo con comprobaciones automáticas y retroalimentación al usuario.
- Mapa intuitivo y detallado: visualización sobre un mapa donde se muestran rutas y límites de las fincas de forma clara y navegable.
- Fichas por unidad: información completa por planta,lote,finca con datos operativos, históricos y métricas de rendimiento.
- UX y rendimiento: componentes modernos que aseguran usabilidad y respuesta eficiente con grandes volúmenes de datos.

Todo esto, logra que el usuario pueda detectar a tiempo posibles ventajas, oportunidades, amenazas y/o desventajas, lo que será útil para el crecimiento de cada finca.

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
- **Python 3.13+** - Lenguaje de programación

### Otras Herramientas
- **Visual Studio Code**: Editor de código ligero y extensible con autocompletado, depuración integrada y terminal.
- **Postman:** Aplicación para probar, depurar y documentar APIs mediante peticiones y colecciones de pruebas.
- **Leaflet**: Librería JavaScript ligera para crear mapas interactivos en la web (marcadores, polígonos, capas).
- **GitHub**: Plataforma para alojar repositorios Git, colaborar en código, gestionar issues y ejecutar CI/CD. 

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
  
Se realizaron pruebas de verificación usando la herramienta POSTMAN. 

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

##**Autores**

CARLOS ANDRES PALACIOS MENA

ESNEIDER BALLESTA PAREDES

KAREN VANESSA PATERNINA YEPES

