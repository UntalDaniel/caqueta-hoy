import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'
import { listarAnonimas, listarNoticiasPorAutor } from '../servicios/firebase'

export default function PanelReportero() {
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()
  const [contadores, setContadores] = useState({ anonAcept: 0, misNoticias: 0 })

  useEffect(() => {
    async function cargar() {
      try {
        const uid = usuarioActual?.uid || ''
        const [anon, mis] = await Promise.all([
          listarAnonimas({ estado: 'aceptado' }).then(r => r.items),
          uid ? listarNoticiasPorAutor(uid) : Promise.resolve([]),
        ])
        setContadores({
          anonAcept: anon.length,
          misNoticias: mis.length,
        })
      } catch (e) {
        setContadores({ anonAcept: 0, misNoticias: 0 })
      }
    }
    if (usuarioActual) cargar()
  }, [usuarioActual])

  return (
    <div>
      <header className="mb-3">
        <h1 className="mt-0">Panel de Reportero</h1>
        <p className="m-0 texto-secundario">Crea y administra tus noticias. Desarrolla anónimas aceptadas.</p>
        <p className="m-0">Bienvenido: <strong>{usuarioActual?.displayName || usuarioActual?.email}</strong></p>
      </header>
      <div className="grid-tarjetas">
        <div className="tarjeta">
          <h3 className="mt-0">📥 Anónimas aceptadas</h3>
          <p>Total: <strong>{contadores.anonAcept}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/anonimas/aceptadas')}>Abrir</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">📝 Mis noticias</h3>
          <p>Total: <strong>{contadores.misNoticias}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/noticias')}>Abrir</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">➕ Nueva noticia</h3>
          <p>Crea una noticia en estado edición o terminado.</p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/noticias/nueva')}>Crear</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

