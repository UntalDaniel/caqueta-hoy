import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { listarAnonimas } from '../servicios/firebase'
import { useNavigate } from 'react-router-dom'

export default function AnonimasAceptadas() {
  const [denuncias, setDenuncias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [cursor, setCursor] = useState(null)
  const navegar = useNavigate()

  async function cargarDenunciasAceptadas(mas = false) {
    try {
      const { items: nuevos, cursor: c } = await listarAnonimas({ estado: 'aceptado', tam: 10, cursor: mas ? cursor : null })
      setDenuncias((prev) => (mas ? [...prev, ...nuevos] : nuevos))
      setCursor(c)
    } catch (e) {
      setError('No se pudieron cargar las denuncias aceptadas. Verifica las reglas de Firestore.')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDenunciasAceptadas(false)
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
    <div className="bloque">
      <div className="fila mb-3">
        <h1 className="m-0" style={{ fontSize: 20 }}>Anónimas aceptadas</h1>
        <Button onClick={() => cargarDenunciasAceptadas(false)}>Refrescar</Button>
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
                <Button size="small" variant="contained" onClick={() => desarrollar(it)}>Desarrollar</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cursor && (
        <div className="mt-3">
          <Button variant="outlined" onClick={() => cargarDenunciasAceptadas(true)}>Cargar más</Button>
        </div>
      )}
    </div>
  )
}

