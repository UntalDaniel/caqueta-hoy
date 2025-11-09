import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarDocumentos, listarNoticiasPublicadas } from '../servicios/firebase'
import { Grid, Card, CardContent, CardMedia, Chip, Box, Select, MenuItem, Button, Skeleton } from '@mui/material'
import { useUsuario } from '../contexto/UsuarioContexto'

export default function Inicio() {
  const { usuarioActual, salir } = useUsuario()
  const [secciones, setSecciones] = useState([])
  const [noticias, setNoticias] = useState([])
  const [cursor, setCursor] = useState(null)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const [municipioSel, setMunicipioSel] = useState('todos')
  const [seccionSel, setSeccionSel] = useState('todas')

  useEffect(() => {
    async function cargar() {
      setError(null)
      setEstaCargando(true)
      try {
        const secc = await listarDocumentos('secciones')
        setSecciones(secc.filter((s) => s.activa))
        const { items, cursor: c } = await listarNoticiasPublicadas({ seccionId: seccionSel, municipio: municipioSel, tam: 9 })
        setNoticias(items)
        setCursor(c)
      } catch (e) {
        setError(`No se pudo cargar el contenido (verifica Firestore). ${e?.message || ''}`.trim())
      } finally {
        setEstaCargando(false)
      }
    }
    cargar()
  }, [seccionSel, municipioSel])

  if (estaCargando)
    return (
      <div>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Card key={i} sx={{ height: '100%' }}>
              <Skeleton variant="rectangular" height={160} />
              <CardContent>
                <Skeleton width="60%" height={24} />
                <Skeleton width="90%" height={18} />
                <Skeleton width="80%" height={18} />
              </CardContent>
            </Card>
          ))}
        </Box>
      </div>
    )

  const municipiosDisponibles = Array.from(
    new Set(noticias.map((n) => (n.municipio || '').trim()).filter((m) => m))
  )

  function filtrarNoticiasPorSeccion(seccionId) {
    let lista = noticias
    if (municipioSel !== 'todos') {
      lista = lista.filter((n) => (n.municipio || '').trim().toLowerCase() === municipioSel.toLowerCase())
    }
    if (seccionSel !== 'todas') {
      lista = lista.filter((n) => n.seccionId === seccionSel)
    }
    if (seccionId) {
      lista = lista.filter((n) => n.seccionId === seccionId)
    }
    return lista
  }

  const hayResultados = secciones.some((s) => filtrarNoticiasPorSeccion(s.id).length > 0)

  return (
    <div>
      {/* Barra de filtros + navegación */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select size="small" value={municipioSel} onChange={(e) => setMunicipioSel(e.target.value)}>
            <MenuItem value="todos">Todos los municipios</MenuItem>
            {municipiosDisponibles.map((m) => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label="Todas las secciones"
              color={seccionSel === 'todas' ? 'primary' : 'default'}
              onClick={() => setSeccionSel('todas')}
            />
            {secciones.map((s) => (
              <Chip
                key={s.id}
                label={s.nombre}
                color={seccionSel === s.id ? 'primary' : 'default'}
                onClick={() => setSeccionSel(s.id)}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {secciones.length === 0 ? (
        <p>No hay secciones activas.</p>
      ) : !hayResultados ? (
        <p>No hay noticias para los filtros seleccionados.</p>
      ) : (
        secciones.map((s) => {
          const deSeccion = filtrarNoticiasPorSeccion(s.id)
          if (deSeccion.length === 0) return null
          return (
            <section key={s.id} style={{ marginBottom: 24 }}>
              <h2>{s.nombre}</h2>
              <Grid container spacing={2}>
                {deSeccion.map((n) => (
                  <Grid key={n.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                      {n.imagenUrl ? (
                        <CardMedia component="img" height="160" image={n.imagenUrl} alt={n.titulo} loading="lazy" />
                      ) : (
                        <Box sx={{ height: 160, bgcolor: 'secondary.main' }} />
                      )}
                      <CardContent>
                        <Chip label={s.nombre} size="small" sx={{ mb: 1 }} color="primary" />
                        {n.municipio && <Chip label={n.municipio} size="small" sx={{ mb: 1, ml: 1 }} />}
                        <h3 style={{ margin: '4px 0 8px' }}>
                          <Link to={`/noticia/${n.id}`}>{n.titulo}</Link>
                        </h3>
                        {n.subtitulo && <p style={{ margin: 0, color: '#4B5563' }}>{n.subtitulo}</p>}
                        <p style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
                          {`Por ${n.autorNombre || 'Autor desconocido'}`}
                        </p>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </section>
          )
        })
      )}
      {cursor && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            disabled={cargandoMas}
            onClick={async () => {
              try {
                setCargandoMas(true)
                const { items, cursor: c } = await listarNoticiasPublicadas({ seccionId: seccionSel, municipio: municipioSel, tam: 9, cursor })
                setNoticias((prev) => [...prev, ...items])
                setCursor(c)
              } catch (e) {
                setError(`No se pudo cargar más noticias. ${e?.message || ''}`.trim())
              } finally {
                setCargandoMas(false)
              }
            }}
          >
            {cargandoMas ? 'Cargando...' : 'Cargar más'}
          </Button>
        </Box>
      )}
    </div>
  )
}
