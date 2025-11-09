export const ROLES = {
  reportero: 'reportero',
  editor: 'editor',
  administrador: 'administrador',
}

export const ESTADOS_NOTICIA = {
  edicion: 'edicion',
  terminado: 'terminado',
  publicado: 'publicado',
  desactivado: 'desactivado',
}

export function crearUsuario({ uid, nombre, correo, rol }) {
  return {
    uid,
    nombre,
    correo,
    rol,
    fechaCreacion: null,
  }
}

export function crearSeccion({ nombre, slug, activa = true }) {
  return {
    nombre,
    slug,
    activa,
  }
}

export function crearNoticia({
  titulo,
  subtitulo = '',
  contenido = '',
  seccionId,
  imagenUrl = '',
  autorUid,
  autorNombre,
  estado = ESTADOS_NOTICIA.edicion,
}) {
  return {
    titulo,
    subtitulo,
    contenido,
    seccionId,
    imagenUrl,
    autorUid,
    autorNombre,
    fechaCreacion: null,
    fechaActualizacion: null,
    estado,
  }
}
