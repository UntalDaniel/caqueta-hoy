import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { listarDocumentos, listarNoticiasPublicadas } from '../servicios/firebase'
import { slugify } from '../servicios/slug'
import TarjetaNoticia from '../Components/TarjetaNoticia'

export default function SeccionPagina() {
  const { slug } = useParams()
  // estados para la sección y sus noticias
  const [secciones, setSecciones] = useState([])
  const [seccion, setSeccion] = useState(null)
  const [noticias, setNoticias] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // cargo secciones activas
    let activo = true
    async function cargarSecciones() {
      try {
        const sec = await listarDocumentos('secciones')
        if (!activo) return
        setSecciones(sec.filter((s) => s.activa))
      } catch (e) {
        // noop
      }
    }
    cargarSecciones()
    return () => {
      activo = false
    }
  }, [])

  // Resolver sección por slug
  useEffect(() => {
    if (!secciones.length) return
    const encontrada = secciones.find((s) => slugify(s.nombre) === slug)
    setSeccion(encontrada || null)
  }, [secciones, slug])

  // Cargar noticias de la sección
  useEffect(() => {
    async function cargar() {
      if (!seccion) return
      // muestro loader mientras traigo las noticias
      setCargando(true)
      setError('')
      try {
        const { items } = await listarNoticiasPublicadas({ seccionId: seccion.id, tam: 60 })
        setNoticias(items)
      } catch (e) {
        setError('No se pudo cargar la sección')
      } finally {
        setEstaCargando(false)
      }
    }
    cargar()
  }, [seccion])

  const slugDeSeccion = useMemo(() => (seccion ? slugify(seccion.nombre) : ''), [seccion])

  if (!seccion && secciones.length) {
    return (
      <div>
        <h1>Sección no encontrada</h1>
        <p>La sección solicitada no existe o no está activa.</p>
      </div>
    )
  }

  return (
    <div>
      <h1>{seccion?.nombre || 'Sección'}</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {estaCargando ? (
        <p>Cargando sección...</p>
      ) : noticias.length === 0 ? (
        <p>No hay noticias en esta sección.</p>
      ) : (
        // renderizo tarjetas de esta sección
        <div className="grid-tarjetas">
          {noticias.map((n) => (
            <TarjetaNoticia
              key={n.id}
              noticia={n}
              seccionNombre={seccion?.nombre || ''}
              linkPath={`/secciones/${slugDeSeccion}/${n.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
