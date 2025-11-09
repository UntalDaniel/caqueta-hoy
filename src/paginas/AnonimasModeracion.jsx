import React, { useEffect, useState } from 'react'
import { Paper, Stack, Typography, Button, TextField, Divider } from '@mui/material'
import { listarAnonimas, actualizarDocumento } from '../servicios/firebase'
import { useNavigate } from 'react-router-dom'

export default function AnonimasModeracion() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(null)
  const [filtro, setFiltro] = useState('pendiente')
  const navegar = useNavigate()

  async function cargar(mas = false) {
    try {
      const { items: nuevos, cursor: c } = await listarAnonimas({ estado: filtro, tam: 10, cursor: mas ? cursor : null })
      setItems((prev) => (mas ? [...prev, ...nuevos] : nuevos))
      setCursor(c)
    } catch (e) {
      setError('No se pudieron cargar las denuncias. Verifica las reglas de Firestore.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    setCargando(true)
    cargar(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro])

  async function cambiarEstado(id, estado) {
    try {
      await actualizarDocumento('anonimas', id, { estado })
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, estado } : x)))
    } catch (e) {
      alert('No se pudo actualizar el estado')
    }
  }

  function desarrollar(item) {
    // Navegamos a crear noticia con prefill por query y state para que editores/reporteros puedan continuar sin leer anonimas
    navegar('/panel/noticias/nueva?anonimaId=' + encodeURIComponent(item.id), {
      state: {
        prefillDesdeAnonima: {
          contenido: item.texto || '',
          imagenUrl: item.evidenciaUrl || '',
        },
      },
    })
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Moderación de anónimas</Typography>
        <TextField
          select
          label="Estado"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          SelectProps={{ native: true }}
          size="small"
        >
          <option value="pendiente">pendiente</option>
          <option value="aceptado">aceptado</option>
          <option value="rechazado">rechazado</option>
          <option value="cerrado">cerrado</option>
        </TextField>
        <Button onClick={() => cargar(false)}>Refrescar</Button>
      </Stack>

      {cargando && <Typography>Cargando...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Stack spacing={2}>
        {items.map((it) => (
          <Paper key={it.id} sx={{ p: 2 }} variant="outlined">
            <Stack spacing={1}>
              <Typography variant="subtitle2">ID: {it.id}</Typography>
              {it.evidenciaUrl && (
                <img src={it.evidenciaUrl} alt="evidencia" style={{ maxWidth: 300 }} />
              )}
              <Typography whiteSpace="pre-wrap">{it.texto}</Typography>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="contained" onClick={() => cambiarEstado(it.id, 'aceptado')}>Aceptar</Button>
                <Button size="small" variant="outlined" onClick={() => cambiarEstado(it.id, 'rechazado')}>Rechazar</Button>
                <Button size="small" onClick={() => cambiarEstado(it.id, 'cerrado')}>Cerrar</Button>
                <Divider flexItem orientation="vertical" />
                <Button size="small" color="secondary" onClick={() => desarrollar(it)}>Desarrollar</Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      {cursor && (
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => cargar(true)}>Cargar más</Button>
      )}
    </Paper>
  )
}
