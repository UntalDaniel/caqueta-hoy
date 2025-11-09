import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarDocumentos, eliminarDocumento, actualizarDocumento } from '../servicios/firebase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Grid, Card, CardContent, CardActions, Button, Chip } from '@mui/material'
import { ROLES, ESTADOS_NOTICIA } from '../servicios/modelos'

export default function NoticiasLista() {
  const { usuarioActual, rol } = useUsuario()
  const [noticias, setNoticias] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const navegar = useNavigate()

  async function cargar() {
    setError(null)
    try {
      const todas = await listarDocumentos('noticias')
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

  async function manejarEliminar(id) {
    const ok = confirm('¿Eliminar esta noticia?')
    if (!ok) return
    try {
      await eliminarDocumento('noticias', id)
      setNoticias((prev) => prev.filter((n) => n.id !== id))
    } catch (e) {
      alert('No se pudo eliminar')
    }
  }

  async function cambiarEstado(noticia, nuevoEstado) {
    try {
      await actualizarDocumento('noticias', noticia.id, { estado: nuevoEstado })
      setNoticias((prev) => prev.map((x) => (x.id === noticia.id ? { ...x, estado: nuevoEstado } : x)))
    } catch (e) {
      alert('No se pudo cambiar el estado')
    }
  }

  if (estaCargando) return <p>Cargando noticias...</p>

  return (
    <div>
      <h1>Noticias</h1>
      <div style={{ marginBottom: 12 }}>
        <Button variant="contained" onClick={() => navegar('/panel/noticias/nueva')}>Nueva noticia</Button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {noticias.length === 0 ? (
        <p>No hay noticias</p>
      ) : (
        <Grid container spacing={2}>
          {noticias.map((n) => (
            <Grid key={n.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Chip label={n.estado} size="small" sx={{ mb: 1 }} color={n.estado === 'publicado' ? 'success' : n.estado === 'desactivado' ? 'default' : 'warning'} />
                  <h3 style={{ margin: '4px 0 8px' }}>{n.titulo}</h3>
                  {n.subtitulo && <p style={{ margin: 0, color: '#4B5563' }}>{n.subtitulo}</p>}
                  <p style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                    {`Por ${n.autorNombre || n.autorUid || 'Autor desconocido'}`}
                  </p>
                  <p style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                    {n.fechaCreacion?.seconds ? new Date(n.fechaCreacion.seconds * 1000).toLocaleString() : ''}
                  </p>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navegar(`/panel/noticias/${n.id}`)}>Editar</Button>
                  {/* Acciones de estado para editores/administradores */}
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
                    color="error"
                    onClick={() => manejarEliminar(n.id)}
                    disabled={n.estado === ESTADOS_NOTICIA.publicado && !(rol === ROLES.editor || rol === ROLES.administrador)}
                  >
                    Eliminar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </div>
  )
}
