import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDocumentos, listarNoticiasPublicadas } from '../servicios/firebase'
import { Chip, Button } from '@mui/material'

export default function Inicio() {
  const [secciones, setSecciones] = useState([])
  const [noticias, setNoticias] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const [municipioSel, setMunicipioSel] = useState('todos')
  const [seccionSel, setSeccionSel] = useState('todas')
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState([])
  

  useEffect(() => {
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

  // Cargar municipios disponibles desde todas las noticias publicadas (una vez)
  useEffect(() => {
    let activo = true
    async function cargarMunicipios() {
      try {
        const todas = await listarDocumentos('noticias')
        if (!activo) return
        const publicados = (todas || []).filter((n) => (n.estado || '').toLowerCase() === 'publicado')
        const unicos = Array.from(
          new Set(publicados.map((n) => (n.municipio || '').trim()).filter((m) => m))
        )
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

  return (
    <div>
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
                  <div key={n.id} className="tarjeta overflow-oculto">
                    {n.imagenUrl ? (
                      <img src={n.imagenUrl} alt={n.titulo} loading="lazy" className="tarjeta-cabecera-img" />
                    ) : (
                      <div className="tarjeta-cabecera-vacia" />
                    )}
                    <div className="mt-2">
                      <Chip label={s.nombre} size="small" sx={{ mb: 1 }} color="primary" />
                      {n.municipio && <Chip label={n.municipio} size="small" sx={{ mb: 1, ml: 1 }} />}
                      <h3 className="mt-1 mb-2">
                        <Link to={`/noticia/${n.id}`}>{n.titulo}</Link>
                      </h3>
                      {n.subtitulo && <p className="m-0 texto-secundario">{n.subtitulo}</p>}
                      <p className="mt-2 texto-pequenio texto-secundario">
                        {`Por ${n.autorNombre || 'Autor desconocido'}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {seccionSel === 'todas' && deSeccion.length > 3 && (
                <div className="mt-2" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Button variant="outlined" onClick={() => setSeccionSel(s.id)}>Ver más</Button>
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

