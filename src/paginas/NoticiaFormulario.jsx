import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { crearDocumento, actualizarDocumento, leerDocumento, listarDocumentos, subirArchivo } from '../servicios/firebase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { ESTADOS_NOTICIA, ROLES } from '../servicios/modelos'
import { TextField, Button } from '@mui/material'

export default function NoticiaFormulario() {
  const { usuarioActual, rol } = useUsuario()
  const params = useParams()
  const location = useLocation()
  const navegar = useNavigate()
  const esEdicion = Boolean(params.id)

  const [secciones, setSecciones] = useState([])
  const [cargando, setCargando] = useState(esEdicion)
  const [error, setError] = useState(null)
  const [datosNoticia, setDatosNoticia] = useState({
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
          setDatosNoticia({
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
        setCargando(false)
      }
    }
    if (esEdicion) cargarNoticia()
  }, [esEdicion, params.id])

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
            setDatosNoticia((prev) => ({
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
        setDatosNoticia((prev) => ({
          ...prev,
          contenido: prefill.contenido || prev.contenido,
          imagenUrl: prefill.imagenUrl || prev.imagenUrl,
        }))
      }
    }
    intentarPrefill()
  }, [location.search])

  function manejarCambio(e) {
    const { name, value } = e.target
    setDatosNoticia((prev) => ({ ...prev, [name]: value }))
  }

  async function manejarArchivo(e) {
    const archivo = e.target.files?.[0]
    if (!archivo || !usuarioActual) return
    try {
      const ruta = `noticias/${usuarioActual.uid}/${Date.now()}_${archivo.name}`
      const url = await subirArchivo(ruta, archivo)
      setDatosNoticia((prev) => ({ ...prev, imagenUrl: url }))
    } catch (err) {
      alert('No se pudo subir la imagen')
    }
  }

  async function manejarEnviar(e) {
    e.preventDefault()
    setError(null)
    try {
      if (!datosNoticia.titulo || !datosNoticia.seccionId || !datosNoticia.municipio) {
        setError('Título, Sección y Municipio son obligatorios')
        return
      }
      const datos = {
        ...datosNoticia,
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

  if (cargando) return <p>Cargando...</p>

  return (
    <div className="contenedor-medio">
      <h1 className="mt-0">{esEdicion ? 'Editar noticia' : 'Nueva noticia'}</h1>
      <form onSubmit={manejarEnviar} className="form-grid">
        <TextField
          label="Título"
          name="titulo"
          value={datosNoticia.titulo}
          onChange={manejarCambio}
          required
          placeholder="Título de la noticia"
        />
        <TextField
          label="Subtítulo"
          name="subtitulo"
          value={datosNoticia.subtitulo}
          onChange={manejarCambio}
          placeholder="Subtítulo o bajante"
        />
        <div>
          <p className="m-0 mb-2">Municipio</p>
          <select
            name="municipio"
            value={datosNoticia.municipio}
            onChange={manejarCambio}
            className="select-simple w-100"
          required
          >
            <option value="">Seleccione un municipio</option>
            <option value="CAQUETÁ">CAQUETÁ</option>
            <option value="FLORENCIA">FLORENCIA</option>
            <option value="ALBANIA">ALBANIA</option>
            <option value="BELEN DE LOS ANDAQUIES">BELEN DE LOS ANDAQUIES</option>
            <option value="CARTAGENA DEL CHAIRA">CARTAGENA DEL CHAIRA</option>
            <option value="CURRILLO">CURRILLO</option>
            <option value="EL DONCELLO">EL DONCELLO</option>
            <option value="EL PAUJIL">EL PAUJIL</option>
            <option value="LA MONTAÑITA">LA MONTAÑITA</option>
            <option value="MILAN">MILAN</option>
            <option value="MORELIA">MORELIA</option>
            <option value="PUERTO RICO">PUERTO RICO</option>
            <option value="SAN JOSE DEL FRAGUA">SAN JOSE DEL FRAGUA</option>
            <option value="SAN VICENTE DEL CAGUAN">SAN VICENTE DEL CAGUAN</option>
            <option value="SOLANO">SOLANO</option>
            <option value="SOLITA">SOLITA</option>
            <option value="VALPARAISO">VALPARAISO</option>
          </select>
        </div>
        <TextField
          label="Contenido"
          name="contenido"
          value={datosNoticia.contenido}
          onChange={manejarCambio}
          multiline
          minRows={6}
          placeholder="Escribe el contenido aquí..."
          required
        />
        <div>
          <p className="m-0 mb-2">Categoría</p>
          <select name="seccionId" value={datosNoticia.seccionId} onChange={manejarCambio} required className="select-simple w-100">
            <option value="" disabled>Elige una categoría</option>
            {secciones.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="m-0 mb-2">Imagen (opcional)</p>
          <Button variant="outlined" component="label">
            Subir imagen
            <input hidden type="file" accept="image/*" onChange={manejarArchivo} />
          </Button>
          {datosNoticia.imagenUrl && (
            <div className="mt-2">
              <img src={datosNoticia.imagenUrl} alt="Imagen subida" className="img-240" />
            </div>
          )}
        </div>
        <div>
          <p className="m-0 mb-2">Estado</p>
          <select name="estado" value={datosNoticia.estado} onChange={manejarCambio} className="select-simple w-100">
            {opcionesEstado.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div className="acciones-linea">
          <Button type="submit" variant="contained">{esEdicion ? 'Guardar cambios' : 'Crear noticia'}</Button>
          <Button type="button" variant="outlined" onClick={() => navegar('/panel/noticias')}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
