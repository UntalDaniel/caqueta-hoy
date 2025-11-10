import React, { useEffect, useState } from 'react'
import { Button, TextField, Checkbox, FormControlLabel } from '@mui/material'
import { listarDocumentos, crearDocumento, eliminarDocumento, actualizarDocumento } from '../servicios/firebase'

export default function VideosAdmin() {
  // estados del admin de videos
  const [videos, setVideos] = useState([])
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [activo, setActivo] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setError(null)
    setCargando(true)
    try {
      const lista = await listarDocumentos('videos')
      // ordenar por fechaCreacion desc si existe
      lista.sort((a, b) => (b.fechaCreacion?.seconds || 0) - (a.fechaCreacion?.seconds || 0))
      setVideos(lista)
    } catch (e) {
      setError('No se pudieron cargar los videos')
    } finally {
      setCargando(false)
    }
  }

  // saca el id del video para embeberlo en el home
  function extraerIdDeYouTube(url) {
    if (!url) return ''
    try {
      const u = new URL(url)
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '')
      }
      if (u.searchParams.get('v')) {
        return u.searchParams.get('v') || ''
      }
      const m = u.pathname.match(/\/embed\/([\w-]{6,})/)
      return m ? m[1] : ''
    } catch {
      const m = String(url).match(/(?:v=|be\/|embed\/)([\w-]{6,})/)
      return m ? m[1] : ''
    }
  }

  useEffect(() => { cargar() }, [])

  // agrega un video nuevo (valida la URL)
  async function agregar(e) {
    e.preventDefault()
    if (!url.trim()) return
    try {
      const idVideo = extraerIdDeYouTube(url.trim())
      if (!idVideo) {
        alert('URL de YouTube inválida. Usa formatos como https://youtu.be/ID o https://www.youtube.com/watch?v=ID')
        return
      }
      const datosVideo = { url: url.trim(), titulo: titulo.trim(), activo, videoId: idVideo }
      await crearDocumento('videos', datosVideo)
      setUrl('')
      setTitulo('')
      setActivo(true)
      await cargar()
    } catch (e) {
      alert(`No se pudo agregar el video. ${e?.message || ''}`)
    }
  }

  // elimina un video de la lista
  async function eliminar(id) {
    const ok = confirm('¿Eliminar este video?')
    if (!ok) return
    try {
      await eliminarDocumento('videos', id)
      setVideos((prev) => prev.filter((v) => v.id !== id))
    } catch (e) {
      alert('No se pudo eliminar')
    }
  }

  // activa/desactiva el video para mostrarlo en Inicio
  async function alternarActivo(v) {
    try {
      await actualizarDocumento('videos', v.id, { activo: !v.activo })
      setVideos((prev) => prev.map((x) => (x.id === v.id ? { ...x, activo: !x.activo } : x)))
    } catch (e) {
      alert('No se pudo actualizar')
    }
  }

  return (
    <div>
      <h1>Videos (YouTube)</h1>
      {/* formulario simple para agregar links */}
      <form onSubmit={agregar} className="mb-3" style={{ display: 'grid', gap: '0.5rem', maxWidth: 600 }}>
        <TextField label="URL de YouTube" size="small" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <TextField label="Título (opcional)" size="small" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <FormControlLabel control={<Checkbox checked={activo} onChange={(e) => setActivo(e.target.checked)} />} label="Activo" />
        <div>
          <Button type="submit" variant="contained">Agregar</Button>
        </div>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {cargando ? (
        <p>Cargando...</p>
      ) : videos.length === 0 ? (
        <p>No hay videos</p>
      ) : (
        <div className="grid-tarjetas">
          {videos.map((v) => (
            <div key={v.id} className="tarjeta">
              <p className="m-0"><strong>{v.titulo || '(Sin título)'}</strong></p>
              <p className="m-0 texto-pequenio" style={{ wordBreak: 'break-all' }}>{v.url}</p>
              <p className="m-0 texto-pequenio">Activo: {v.activo ? 'Sí' : 'No'}</p>
              <div className="acciones-linea mt-1">
                <Button size="small" onClick={() => window.open(v.url, '_blank', 'noopener')}>Abrir</Button>
                <Button size="small" onClick={() => alternarActivo(v)}>{v.activo ? 'Desactivar' : 'Activar'}</Button>
                <Button size="small" color="error" onClick={() => eliminar(v.id)}>Eliminar</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
