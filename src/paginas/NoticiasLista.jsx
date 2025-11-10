import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarDocumentos, eliminarDocumento, actualizarDocumento } from '../servicios/firebase'
import { slugify } from '../servicios/slug'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Button, Chip } from '@mui/material'
import { ROLES, ESTADOS_NOTICIA } from '../servicios/modelos'

export default function NoticiasLista() {
  const { usuarioActual, rol } = useUsuario()
  // estados para lista, carga y errores
  const [noticias, setNoticias] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const [secciones, setSecciones] = useState([])
  const navegar = useNavigate()

  // cargo noticias y secciones
  async function cargar() {
    setError(null)
    try {
      const [todas, secc] = await Promise.all([
        listarDocumentos('noticias'),
        listarDocumentos('secciones'),
      ])
      setSecciones(secc)
      // si no es editor/admin, solo muestro mis noticias
      const esGestor = rol === ROLES.editor || rol === ROLES.administrador
      const filtradas = esGestor ? todas : todas.filter((n) => n.autorUid === usuarioActual?.uid)
      filtradas.sort((a, b) => (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0))
      setNoticias(filtradas)
    } catch (e) {
      setError('No se pudo cargar noticias (verifica Firestore)')
    } finally {
      setEstaCargando(false)
    }
  }

  useEffect(() => {
    if (usuarioActual) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual, rol])

  // eliminar una noticia por id
  async function eliminarNoticia(id) {
    const ok = confirm('¿Eliminar esta noticia?')
    if (!ok) return
    try {
      await eliminarDocumento('noticias', id)
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      alert('No se pudo eliminar')
    }
  }

  // cambiar estado (solo para editor/admin)
  async function cambiarEstado(noticia, nuevoEstado) {
    try {
      await actualizarDocumento('noticias', noticia.id, { estado: nuevoEstado })
      setNoticias((prev) => prev.map((x) => (x.id === noticia.id ? { ...x, estado: nuevoEstado } : x)))
    } catch (e) {
      alert('No se pudo cambiar el estado')
    }
  }

  // buscar el slug de la sección para armar el link público
  function obtenerSlugSeccion(seccionId) {
    const s = secciones.find((x) => x.id === seccionId)
    if (!s) return ''
    return s.slug || slugify(s.nombre || '')
  }

  if (estaCargando) return <p>Cargando noticias...</p>

  return (
    <div>
      <h1>Noticias</h1>
      <div className="mb-3">
        <Button variant="contained" onClick={() => navegar('/panel/noticias/nueva')}>Nueva noticia</Button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {noticias.length === 0 ? (
        <p>No hay noticias</p>
      ) : (
        <div className="grid-tarjetas">
          {noticias.map((n) => (
            <div key={n.id} className="tarjeta overflow-oculto" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {n.imagenUrl ? (
                <img src={n.imagenUrl} alt={n.titulo} loading="lazy" className="tarjeta-cabecera-img" />
              ) : (
                <div className="tarjeta-cabecera-vacia" />
              )}
              <div style={{ flexGrow: 1 }}>
                <Chip label={n.estado} size="small" sx={{ mb: 1 }} color={n.estado === 'publicado' ? 'success' : n.estado === 'desactivado' ? 'default' : 'warning'} />
                <h3 className="mt-1 mb-2">{n.titulo}</h3>
                {n.subtitulo && <p className="m-0 texto-secundario">{n.subtitulo}</p>}
                <p className="mt-2 texto-pequenio texto-secundario">
                  {`Por ${n.autorNombre || n.autorUid || 'Autor desconocido'}`}
                </p>
                <p className="mt-2 texto-pequenio texto-secundario">
                  {n.fechaCreacion?.seconds ? new Date(n.fechaCreacion.seconds * 1000).toLocaleString() : ''}
                </p>
              </div>
              <div className="acciones-linea">
                <Button size="small" onClick={() => navegar(`/panel/noticias/${n.id}`)}>Editar</Button>
                {(rol === ROLES.editor || rol === ROLES.administrador) && (
                  <>
                    {n.estado !== ESTADOS_NOTICIA.publicado && (
                      <Button size="small" color="success" onClick={() => cambiarEstado(n, ESTADOS_NOTICIA.publicado)}>Publicar</Button>
                    )}
                    {n.estado === ESTADOS_NOTICIA.publicado && (
                      <Button size="small" onClick={() => cambiarEstado(n, ESTADOS_NOTICIA.desactivado)}>Desactivar</Button>
                    )}
                    {n.estado === ESTADOS_NOTICIA.edicion && (
                      <Button size="small" onClick={() => cambiarEstado(n, ESTADOS_NOTICIA.terminado)}>Marcar terminado</Button>
                    )}
                  </>
                )}
                <Button
                  size="small"
                  component="a"
                  href={`/secciones/${obtenerSlugSeccion(n.seccionId)}/${n.id}`}
                  target="_blank"
                  rel="noopener"
                >
                  Vista pública
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => eliminarNoticia(n.id)}
                  disabled={n.estado === ESTADOS_NOTICIA.publicado && !(rol === ROLES.editor || rol === ROLES.administrador)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

