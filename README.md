# Sports Analytics - Backend 🚀

Este es el servidor Backend para la aplicación web **Sports Analytics**, construido con Node.js, Express y TypeScript. Proporciona una API REST que actúa como un puente (proxy) inteligente conectándose a **API-Football v3**, transformando y paginando los datos para que el Frontend los consuma de manera limpia y estandarizada.

## 🏗 Arquitectura y Estructura

El proyecto sigue una arquitectura limpia (MVC/Capas) para facilitar su escalabilidad:

```
backend/
├── src/
│   ├── controllers/      # Lógica de las rutas (manejo de endpoints de jugadores)
│   ├── routes/           # Definición de las URLs de la API (ej: /api/players)
│   ├── services/         # Conexión pura con API-Football usando Axios
│   ├── utils/            # Utilidades generales (validadores, helpers)
│   ├── app.ts            # Configuración principal de Express y middlewares
│   └── server.ts         # Archivo de arranque del servidor
├── .env                  # Variables de entorno confidenciales (no versionado)
├── Dockerfile            # Instrucciones de la imagen Docker
├── package.json          # Dependencias y scripts
└── tsconfig.json         # Configuración del compilador TypeScript
```

## 🔐 Variables de Entorno

Para que el backend funcione, necesitas un archivo `.env` en la raíz de `backend/` con las siguientes llaves:

```env
PORT=5000
FOOTBALL_DATA_API_KEY=tu_api_key_de_api_football
FOOTBALL_DATA_BASE_URL=https://v3.football.api-sports.io
```
*(Nota: El API permite 100 peticiones gratuitas al día. Las búsquedas en vivo las consumen rápidamente).*

## ⚙️ Cómo ejecutar el proyecto (Local)

1. **Instalar dependencias**:
   ```bash
   npm install
   ```
2. **Modo Desarrollo (Hot Reload / ts-node)**:
   ```bash
   npm run dev
   ```
   *El servidor correrá en `http://localhost:5000` (o el puerto definido).*

3. **Modo Producción (Build)**:
   ```bash
   npm run build
   npm start
   ```

## 🐳 Despliegue con Docker

El proyecto ya cuenta con su respectivo `Dockerfile` configurado para producción.

1. **Construir la imagen**:
   ```bash
   docker build -t sports-analytics-backend .
   ```
2. **Levantar el contenedor**:
   ```bash
   # Inyectando el archivo local .env hacia el contenedor
   docker run -d -p 5000:3001 --env-file .env --name sb-backend sports-analytics-backend
   ```
*(Nota: El backend en Docker expone el puerto 3001 de manera interna, según su Dockerfile)*
