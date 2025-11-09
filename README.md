# Caquetá Hoy – CMS de Noticias (React + Firebase)

Proyecto sencillo de CMS para administrar noticias con roles: reportero, editor y administrador.

## Requisitos
- Node 18+
- Proyecto Firebase con Authentication, Firestore y Storage

## Instalación
- `npm install`
- Copiar `.env.example` a `.env` y poner tus llaves de Firebase:
  - `VITE_FIREBASE_API_KEY=`
  - `VITE_FIREBASE_AUTH_DOMAIN=`
  - `VITE_FIREBASE_PROJECT_ID=`
  - `VITE_FIREBASE_STORAGE_BUCKET=`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID=`
  - `VITE_FIREBASE_APP_ID=`
- `npm run dev` y abrir el link que sale en consola

## Roles
- Se guardan en `usuarios/{uid}.rol`
- Valores: `reportero`, `editor`, `administrador`
- El admin puede cambiar el rol en Panel → Usuarios

## Reglas Firestore (producción)
Pegar en Firebase Console → Firestore → Reglas.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return isSignedIn() && request.auth.uid == uid; }
    function isEditor() { return isSignedIn() && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)) && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "editor"; }
    function isAdmin() { return isSignedIn() && exists(/databases/$(database)/documents/usuarios/$(request.auth.uid)) && get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == "administrador"; }

    match /usuarios/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);
      allow update: if (isOwner(uid) && request.resource.data.rol == resource.data.rol) || isAdmin();
      allow delete: if false;
    }

    match /secciones/{id} {
      allow read: if true;
      allow create, update, delete: if isEditor() || isAdmin();
    }

    match /noticias/{id} {
      allow read: if resource.data.estado == "publicado" || isSignedIn();
      allow create: if isSignedIn() && request.resource.data.autorUid == request.auth.uid && request.resource.data.estado in ["edicion", "terminado"];
      allow update: if (isAdmin() || isEditor()) || (isOwner(resource.data.autorUid) && request.resource.data.autorUid == resource.data.autorUid && request.resource.data.estado in ["edicion", "terminado"]);
      allow delete: if (isAdmin() || isEditor()) || (isOwner(resource.data.autorUid) && resource.data.estado != "publicado");
    }
  }
}
```

## Reglas Storage
Pegar en Firebase Console → Storage → Reglas.

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} { allow read: if true; }
    match /noticias/{uid}/{filename=**} { allow write: if request.auth != null && request.auth.uid == uid; }
    match /{everythingElse=**} { allow write: if false; }
  }
}
```

## Despliegue (Vercel)
- Subir el proyecto a GitHub
- En Vercel: importar el repo → Framework “Vite”
- Agregar variables `VITE_FIREBASE_*`
- Deploy (build: `npm run build`, output: `dist`)

## Estructura rápida
- `src/servicios/firebase.js` (Auth/DB/Storage)
- `src/contexto/UsuarioContexto.jsx` (sesión y rol en tiempo real)
- `src/paginas/*` (Inicio, Detalle, Ingresar, Panel por rol, CRUD)
- `src/rutas/RutaPrivada.jsx` y `src/rutas/RutaRol.jsx`

## Uso básico
- Crear cuenta (reportero por defecto)
- Un admin cambia roles en `/panel/usuarios`
- Reportero crea/edita sus noticias (estados: edición/terminado)
- Editor/Admin pueden publicar/desactivar y manejar secciones

## Notas
- Lectura pública solo de noticias en estado “publicado”
- Imágenes públicas (lectura) y subidas por carpeta del usuario
