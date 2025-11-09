import React, { useEffect, useState } from 'react'
import { Paper, Stack, Typography, Button } from '@mui/material'
import { listarAnonimas } from '../servicios/firebase'
import { useNavigate } from 'react-router-dom'

export default function AnonimasAceptadas() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(null)
  const navegar = useNavigate()

  async function cargar(mas = false) {
    try {
      const { items: nuevos, cursor: c } = await listarAnonimas({ estado: 'aceptado', tam: 10, cursor: mas ? cursor : null })
      setItems((prev) => (mas ? [...prev, ...nuevos] : nuevos))
      setCursor(c)
    } catch (e) {
      setError('No se pudieron cargar las denuncias aceptadas. Verifica las reglas de Firestore.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function desarrollar(item) {
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
        <Typography variant="h5">Anónimas aceptadas</Typography>
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
                <Button size="small" variant="contained" onClick={() => desarrollar(it)}>Desarrollar</Button>
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
