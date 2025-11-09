import React, { useEffect, useState } from 'react'
import { Button, TextField, Divider } from '@mui/material'
import { listarAnonimas, actualizarDocumento } from '../servicios/firebase'
import { useNavigate } from 'react-router-dom'

export default function AnonimasModeracion() {
  const [denuncias, setDenuncias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(null)
  const [estadoFiltro, setEstadoFiltro] = useState('pendiente')
  const navegar = useNavigate()

  async function cargarDenuncias(mas = false) {
    try {
      const { items: nuevos, cursor: c } = await listarAnonimas({ estado: estadoFiltro, tam: 10, cursor: mas ? cursor : null })
      setDenuncias((prev) => (mas ? [...prev, ...nuevos] : nuevos))
      setCursor(c)
    } catch (e) {
      setError('No se pudieron cargar las denuncias. Verifica las reglas de Firestore.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    setCargando(true)
    cargarDenuncias(false)
  }, [estadoFiltro])

  async function actualizarEstadoDenuncia(id, estado) {
    try {
      await actualizarDocumento('anonimas', id, { estado })
      setDenuncias((prev) => prev.map((x) => (x.id === id ? { ...x, estado } : x)))
    } catch (e) {
      alert('No se pudo actualizar el estado')
    }
  }

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
    <div className="bloque">
      <div className="fila mb-3">
        <h1 className="m-0" style={{ fontSize: 20 }}>Moderación de anónimas</h1>
        <TextField
          select
          label="Estado"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          SelectProps={{ native: true }}
          size="small"
        >
          <option value="pendiente">pendiente</option>
          <option value="aceptado">aceptado</option>
          <option value="rechazado">rechazado</option>
          <option value="cerrado">cerrado</option>
        </TextField>
        <Button onClick={() => cargarDenuncias(false)}>Refrescar</Button>
      </div>

      {cargando && <p className="mt-2">Cargando...</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <div className="grid-tarjetas">
        {denuncias.map((it) => (
          <div key={it.id} className="tarjeta">
            <div className="bloque">
              <p className="m-0 texto-pequenio texto-secundario">ID: {it.id}</p>
              {it.evidenciaUrl && (
                <img src={it.evidenciaUrl} alt="evidencia" className="img-max-300" />
              )}
              <p style={{ whiteSpace: 'pre-wrap' }} className="m-0">{it.texto}</p>
              <div className="acciones-linea">
                <Button size="small" variant="contained" onClick={() => actualizarEstadoDenuncia(it.id, 'aceptado')}>Aceptar</Button>
                <Button size="small" variant="outlined" onClick={() => actualizarEstadoDenuncia(it.id, 'rechazado')}>Rechazar</Button>
                <Button size="small" onClick={() => actualizarEstadoDenuncia(it.id, 'cerrado')}>Cerrar</Button>
                <Divider orientation="vertical" flexItem />
                <Button size="small" color="secondary" onClick={() => desarrollar(it)}>Desarrollar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cursor && (
        <div className="mt-3">
          <Button variant="outlined" onClick={() => cargarDenuncias(true)}>Cargar más</Button>
        </div>
      )}
    </div>
  )
}

