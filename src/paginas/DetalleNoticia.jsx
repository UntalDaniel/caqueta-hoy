import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { leerDocumento } from '../servicios/firebase'

export default function DetalleNoticia() {
  const params = useParams()
  const [noticia, setNoticia] = useState(null)
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      setError(null)
      try {
        const doc = await leerDocumento('noticias', params.id)
        setNoticia(doc)
      } catch (e) {
        setError('No se pudo cargar la noticia.')
      } finally {
        setEstaCargando(false)
      }
    }
    if (params.id) cargar()
  }, [params.id])

  if (estaCargando) return <p>Cargando...</p>
  if (!noticia) return <p>No existe esta noticia.</p>
  if (noticia.estado !== 'publicado') return <p>Esta noticia no está publicada.</p>

  return (
    <article>
      <p><Link to="/">Volver</Link></p>
      <h1>{noticia.titulo}</h1>
      {noticia.subtitulo && <h3>{noticia.subtitulo}</h3>}
      {noticia.imagenUrl && (
        <div style={{ margin: '16px 0' }}>
          <img src={noticia.imagenUrl} alt={noticia.titulo} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
      <p style={{ whiteSpace: 'pre-wrap' }}>{noticia.contenido}</p>
      <p style={{ color: '#555' }}>
        Por {noticia.autorNombre} · {noticia.fechaCreacion?.seconds ? new Date(noticia.fechaCreacion.seconds * 1000).toLocaleString() : ''}
      </p>
    </article>
  )
}
