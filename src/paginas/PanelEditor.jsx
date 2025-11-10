import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'
import { listarDocumentos, listarAnonimas } from '../servicios/firebase'

export default function PanelEditor() {
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()
  // totales que ve el editor
  const [contadores, setContadores] = useState({ anonimasAceptadas: 0, noticias: 0, secciones: 0 })

  useEffect(() => {
    // cargo conteos básicos para el panel
    async function cargar() {
      try {
        const [anon, noti, sec] = await Promise.all([
          listarAnonimas({ estado: 'aceptado' }).then(r => r.items),
          listarDocumentos('noticias'),
          listarDocumentos('secciones'),
        ])
        setContadores({
          anonimasAceptadas: anon.length,
          noticias: noti.length,
          secciones: sec.length,
        })
      } catch (e) {
        setContadores({ anonimasAceptadas: 0, noticias: 0, secciones: 0 })
      }
    }
    cargar()
  }, [])

  return (
    <div>
      <header className="mb-3">
        <h1 className="mt-0">Panel de Editor</h1>
        <p className="m-0 texto-secundario">Gestiona publicaciones y desarrolla anónimas aceptadas.</p>
        <p className="m-0">Bienvenido: <strong>{usuarioActual?.displayName || usuarioActual?.email}</strong></p>
      </header>
      {/* accesos rápidos para el editor */}
      <div className="grid-tarjetas">
        <div className="tarjeta">
          <h3 className="mt-0">📥 Anónimas aceptadas</h3>
          <p>Total: <strong>{contadores.anonimasAceptadas}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/anonimas/aceptadas')}>Abrir</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">📰 Todas las noticias</h3>
          <p>Total: <strong>{contadores.noticias}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/noticias')}>Abrir</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">➕ Nueva noticia</h3>
          <p>Crea y publica si está lista.</p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/noticias/nueva')}>Crear</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">📚 Secciones</h3>
          <p>Total: <strong>{contadores.secciones}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/secciones')}>Gestionar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

