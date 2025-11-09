import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { crearDocumento, actualizarDocumento, leerDocumento, listarDocumentos, subirArchivo } from '../servicios/firebase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { ESTADOS_NOTICIA, ROLES } from '../servicios/modelos'
import { Paper, Stack, TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl } from '@mui/material'

export default function NoticiaFormulario() {
  const { usuarioActual, rol } = useUsuario()
  const params = useParams()
  const location = useLocation()
  const navegar = useNavigate()
  const esEdicion = Boolean(params.id)

  const [secciones, setSecciones] = useState([])
  const [estaCargando, setEstaCargando] = useState(esEdicion)
  const [error, setError] = useState(null)
  const [valores, setValores] = useState({
    titulo: '',
    subtitulo: '',
    municipio: '',
    contenido: '',
    seccionId: '',
    imagenUrl: '',
    estado: ESTADOS_NOTICIA.edicion,
  })

  useEffect(() => {
    async function cargarSecciones() {
      try {
        const lista = await listarDocumentos('secciones')
        setSecciones(lista.filter((s) => s.activa))
      } catch (e) {
        // ignorar
      }
    }
    cargarSecciones()
  }, [])

  useEffect(() => {
    async function cargarNoticia() {
      try {
        const existente = await leerDocumento('noticias', params.id)
        if (existente) {
          setValores({
            titulo: existente.titulo || '',
            subtitulo: existente.subtitulo || '',
            municipio: existente.municipio || '',
            contenido: existente.contenido || '',
            seccionId: existente.seccionId || '',
            imagenUrl: existente.imagenUrl || '',
            estado: existente.estado || ESTADOS_NOTICIA.edicion,
          })
        }
      } catch (e) {
        setError('No se pudo cargar la noticia')
      } finally {
        setEstaCargando(false)
      }
    }
    if (esEdicion) cargarNoticia()
  }, [esEdicion, params.id])

  // Prefill desde denuncia anónima aceptada: usa state o intenta leer el doc si hay permiso
  useEffect(() => {
    if (esEdicion) return
    const search = new URLSearchParams(location.search)
    const anonimaId = search.get('anonimaId')
    const prefill = location.state?.prefillDesdeAnonima
    async function intentarPrefill() {
      try {
        if (anonimaId) {
          const anon = await leerDocumento('anonimas', anonimaId)
          if (anon) {
            setValores((prev) => ({
              ...prev,
              contenido: anon.texto || prev.contenido,
              imagenUrl: anon.evidenciaUrl || prev.imagenUrl,
            }))
            return
          }
        }
      } catch (e) {
        // Si no hay permiso para leer, hacemos fallback al prefill del state
      }
      if (prefill) {
        setValores((prev) => ({
          ...prev,
          contenido: prefill.contenido || prev.contenido,
          imagenUrl: prefill.imagenUrl || prev.imagenUrl,
        }))
      }
    }
    intentarPrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  function manejarCambio(e) {
    const { name, value } = e.target
    setValores((prev) => ({ ...prev, [name]: value }))
  }

  async function manejarArchivo(e) {
    const archivo = e.target.files?.[0]
    if (!archivo || !usuarioActual) return
    try {
      const ruta = `noticias/${usuarioActual.uid}/${Date.now()}_${archivo.name}`
      const url = await subirArchivo(ruta, archivo)
      setValores((prev) => ({ ...prev, imagenUrl: url }))
    } catch (err) {
      alert('No se pudo subir la imagen')
    }
  }

  async function manejarEnviar(e) {
    e.preventDefault()
    setError(null)
    try {
      if (!valores.titulo || !valores.seccionId) {
        setError('Título y Sección son obligatorios')
        return
      }
      const datos = {
        ...valores,
        autorUid: usuarioActual?.uid || '',
        autorNombre: usuarioActual?.displayName || usuarioActual?.email || '',
      }
      if (esEdicion) {
        await actualizarDocumento('noticias', params.id, datos)
      } else {
        await crearDocumento('noticias', datos)
      }
      navegar('/panel/noticias')
    } catch (e) {
      setError('No se pudo guardar la noticia')
    }
  }

  const puedePublicar = rol === ROLES.editor || rol === ROLES.administrador
  const opcionesEstado = puedePublicar
    ? [ESTADOS_NOTICIA.edicion, ESTADOS_NOTICIA.terminado, ESTADOS_NOTICIA.publicado, ESTADOS_NOTICIA.desactivado]
    : [ESTADOS_NOTICIA.edicion, ESTADOS_NOTICIA.terminado]

  if (estaCargando) return <p>Cargando...</p>

  return (
    <Paper sx={{ maxWidth: 720, p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {esEdicion ? 'Editar noticia' : 'Nueva noticia'}
      </Typography>
      <Stack component="form" spacing={2} onSubmit={manejarEnviar}>
        <TextField
          label="Título"
          name="titulo"
          value={valores.titulo}
          onChange={manejarCambio}
          required
          placeholder="Título de la noticia"
        />
        <TextField
          label="Subtítulo"
          name="subtitulo"
          value={valores.subtitulo}
          onChange={manejarCambio}
          placeholder="Subtítulo o bajante"
        />
        <TextField
          label="Municipio / ubicación"
          name="municipio"
          value={valores.municipio}
          onChange={manejarCambio}
          placeholder="Ej: Florencia, San Vicente del Caguán"
        />
        <TextField
          label="Contenido"
          name="contenido"
          value={valores.contenido}
          onChange={manejarCambio}
          multiline
          minRows={6}
          placeholder="Escribe el contenido aquí..."
          required
        />
        <FormControl>
          <InputLabel id="seccion-label">Categoría</InputLabel>
          <Select
            labelId="seccion-label"
            label="Categoría"
            name="seccionId"
            value={valores.seccionId}
            onChange={manejarCambio}
            required
          >
            {secciones.map((s) => (
              <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <div>
          <Typography variant="body2" sx={{ mb: 1 }}>Imagen (opcional)</Typography>
          <Button variant="outlined" component="label">
            Subir imagen
            <input hidden type="file" accept="image/*" onChange={manejarArchivo} />
          </Button>
          {valores.imagenUrl && (
            <div style={{ marginTop: 8 }}>
              <img src={valores.imagenUrl} alt="Imagen subida" style={{ maxWidth: 240, height: 'auto' }} />
            </div>
          )}
        </div>
        <FormControl>
          <InputLabel id="estado-label">Estado</InputLabel>
          <Select
            labelId="estado-label"
            label="Estado"
            name="estado"
            value={valores.estado}
            onChange={manejarCambio}
          >
            {opcionesEstado.map((e) => (
              <MenuItem key={e} value={e}>{e}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {error && <Typography color="error">{error}</Typography>}
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained">{esEdicion ? 'Guardar cambios' : 'Crear noticia'}</Button>
          <Button type="button" variant="outlined" onClick={() => navegar('/panel/noticias')}>Cancelar</Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
