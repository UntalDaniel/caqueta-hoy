# Caquetá Hoy

Proyecto final para gestión de noticias del departamento (React + Firebase).

## Stack
- React + Vite + MUI
- Firebase Auth, Firestore y Storage

## Setup
1. Node 18+ y npm
2. `npm install`
3. Copia `.env.example` a `.env` y completa las variables `VITE_FIREBASE_*`
4. `npm run dev`

## Roles y acceso
- Roles: reportero, editor, administrador (en `usuarios/{uid}.rol`)
- Panel por rol (rutas privadas) y CRUD de noticias y secciones

## Estructura rápida
- `src/servicios/*`: Firebase y helpers
- `src/contexto/*`: sesión y rol
- `src/paginas/*`: vistas (inicio, detalle, panel y CRUD)
- `src/rutas/*`: protecciones de ruta

## Notas
- Noticias públicas solo en estado “publicado”
- Evidencias anónimas opcionales desde el footer

## Scripts
- `npm run dev` — entorno local
- `npm run build` — build de producción
