import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { slugify } from '../servicios/slug'
import { listarDocumentos, listarNoticiasPublicadas } from '../servicios/firebase'
import TarjetaNoticia from '../Components/TarjetaNoticia'
import { Chip, Button } from '@mui/material'

export default function Inicio() {
  const navegar = useNavigate()
  // estados para filtros, datos y carrusel
  const [secciones, setSecciones] = useState([])
  const [noticias, setNoticias] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const [municipioSel, setMunicipioSel] = useState('todos')
  const [seccionSel, setSeccionSel] = useState('todas')
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([])
  const [videos, setVideos] = useState([])
  const [indiceVideo, setIndiceVideo] = useState(0)
  const [toqueInicio, setToqueInicio] = useState(null)
  const [desplazamientoToque, setDesplazamientoToque] = useState(0)
  

  useEffect(() => {
    // cargo noticias según filtros seleccionados
    async function cargarNoticias() {
      setError(null)
      setEstaCargando(true)
      try {
        const { items } = await listarNoticiasPublicadas({ seccionId: seccionSel, municipio: municipioSel, tam: 60 })
        setNoticias(items)
      } catch (e) {
        setError(`No se pudo cargar el contenido (verifica Firestore). ${e?.message || ''}`.trim())
      } finally {
        setEstaCargando(false)
      }
    }
    cargarNoticias()
  }, [seccionSel, municipioSel])

  // Cargar secciones una sola vez
  useEffect(() => {
    let activo = true
    async function cargarSecciones() {
      try {
        const secc = await listarDocumentos('secciones')
        if (!activo) return
        setSecciones(secc.filter((s) => s.activa))
      } catch (e) {
        // ignorar
      }
    }
    cargarSecciones()
    return () => { activo = false }
  }, [])

  // Cargar videos una sola vez
  useEffect(() => {
    let activo = true
    async function cargarVideos() {
      try {
        const items = await listarDocumentos('videos')
        if (!activo) return
        const activos = (items || []).filter(v => v.activo)
        setVideos(activos)
      } catch (e) {
        // ignorar
      }
    }
    cargarVideos()
    return () => { activo = false }
  }, [])

  // Cargar municipios disponibles desde noticias publicadas (una vez)
  useEffect(() => {
    let activo = true
    async function cargarMunicipios() {
      try {
        const { items } = await listarNoticiasPublicadas({ tam: 200 })
        if (!activo) return
        const unicos = Array.from(new Set((items || []).map((n) => (n.municipio || '').trim()).filter((m) => m)))
        setMunicipiosDisponibles(unicos)
      } catch (e) {
        // ignorar
      }
    }
    cargarMunicipios()
    return () => { activo = false }
  }, [])

  function filtrarNoticiasPorSeccion(seccionId) {
    return noticias.filter((n) => n.seccionId === seccionId)
  }

  const hayResultados = secciones.some((s) => filtrarNoticiasPorSeccion(s.id).length > 0)

  // parseo el id del video de YouTube desde distintas URLs
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

  // gestos de swipe: inicio del toque
  function alTocarInicio(e) {
    if (!videos.length) return
    const t = e.touches && e.touches[0]
    if (!t) return
    setToqueInicio({ x: t.clientX, y: t.clientY })
    setDesplazamientoToque(0)
  }

  // gestos de swipe: mover
  function alMoverToque(e) {
    if (!toqueInicio) return
    const t = e.touches && e.touches[0]
    if (!t) return
    const dx = t.clientX - toqueInicio.x
    const dy = t.clientY - toqueInicio.y
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault()
      setDesplazamientoToque(dx)
    }
  }

  // gestos de swipe: terminar y cambiar de video
  function alTerminarToque() {
    if (!toqueInicio) return
    const umbral = 40
    if (desplazamientoToque > umbral) {
      setIndiceVideo((p) => (p - 1 + videos.length) % videos.length)
    } else if (desplazamientoToque < -umbral) {
      setIndiceVideo((p) => (p + 1) % videos.length)
    }
    setToqueInicio(null)
    setDesplazamientoToque(0)
  }

  return (
    <div>
      {videos.length > 0 && (
        <section className="mb-6">
          <h2>🎬 Noticias en video</h2>
          <div className="carrusel">
            <button className="carrusel-btn" aria-label="Anterior" onClick={() => setIndiceVideo((p) => (p - 1 + videos.length) % videos.length)}>‹</button>
            <div
              className="carrusel-contenedor"
              onTouchStart={alTocarInicio}
              onTouchMove={alMoverToque}
              onTouchEnd={alTerminarToque}
            >
              {videos.map((v, i) => {
                const id = v.videoId || extraerIdDeYouTube(v.url)
                const visible = i === indiceVideo
                return (
                  <div key={v.id} className={`carrusel-item ${visible ? 'activo' : ''}`}>
                    {visible && id ? (
                      <div className="video-wrapper">
                        <iframe
                          width="560"
                          height="315"
                          src={`https://www.youtube.com/embed/${id}`}
                          title={v.titulo || 'Video de YouTube'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="video-wrapper" />
                    )}
                    <div className="mt-1" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                      <p className="m-0"><strong>{v.titulo || 'Video'}</strong></p>
                    </div>
                  </div>
                )
              })}
            </div>
            <button className="carrusel-btn" aria-label="Siguiente" onClick={() => setIndiceVideo((p) => (p + 1) % videos.length)}>›</button>
          </div>
          <div className="carrusel-indicadores">
            {videos.map((_, i) => (
              <button key={i} className={`punto ${i === indiceVideo ? 'activo' : ''}`} onClick={() => setIndiceVideo(i)} aria-label={`Ir al video ${i + 1}`} />
            ))}
          </div>
        </section>
      )}
      <div className="barra-filtros">
        <select value={municipioSel} onChange={(e) => setMunicipioSel(e.target.value)} className="select-simple select-fijo">
          <option value="todos">Todos los municipios</option>
          {municipiosDisponibles.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="chips-filtros">
          <Chip
            label="Todas las secciones"
            size="small"
            color={seccionSel === 'todas' ? 'primary' : 'default'}
            onClick={() => setSeccionSel('todas')}
          />
          {secciones.map((s) => (
            <Chip
              key={s.id}
              label={s.nombre}
              size="small"
              color={seccionSel === s.id ? 'primary' : 'default'}
              onClick={() => setSeccionSel(s.id)}
            />
          ))}
        </div>
      </div>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div className="resultados-contenedor">
        {estaCargando ? (
          <div className="grid-tarjetas">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="tarjeta-cabecera-vacia" />
                <div className="mt-2">
                  <div className="skeleton-bar alta" />
                  <div className="skeleton-bar media" />
                  <div className="skeleton-bar baja" />
                </div>
              </div>
            ))}
          </div>
        ) : secciones.length === 0 ? (
          <p>No hay secciones activas.</p>
        ) : !hayResultados ? (
          <p>No hay noticias para mostrar.</p>
        ) : (
          secciones.map((s) => {
          const deSeccion = filtrarNoticiasPorSeccion(s.id)
          if (deSeccion.length === 0) return null
          const listaMostrar = seccionSel === 'todas' ? deSeccion.slice(0, 3) : deSeccion
          return (
            <section key={s.id} className="mb-6">
              <h2>{s.nombre}</h2>
              <div className="grid-tarjetas">
                {listaMostrar.map((n) => (
                  <TarjetaNoticia
                    key={n.id}
                    noticia={n}
                    seccionNombre={s.nombre}
                    linkPath={`/secciones/${slugify(s.nombre)}/${n.id}`}
                  />
                ))}
              </div>
              {seccionSel === 'todas' && deSeccion.length > 3 && (
                <div className="mt-2" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant="outlined" onClick={() => navegar(`/secciones/${slugify(s.nombre)}`)}>Ver más</Button>
                </div>
              )}
            </section>
          )
          })
        )}
      </div>
    </div>
  )
}

