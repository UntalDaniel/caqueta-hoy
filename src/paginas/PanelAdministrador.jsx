import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'
import { listarDocumentos } from '../servicios/firebase'

export default function PanelAdministrador() {
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()
  const [contadores, setContadores] = useState({ anonPend: 0, usuarios: 0, secciones: 0, noticias: 0 })

  useEffect(() => {
    async function cargar() {
      try {
        const [anon, us, sec, noti] = await Promise.all([
          listarDocumentos('anonimas'),
          listarDocumentos('usuarios'),
          listarDocumentos('secciones'),
          listarDocumentos('noticias'),
        ])
        setContadores({
          anonPend: anon.filter((a) => a.estado === 'pendiente').length,
          usuarios: us.length,
          secciones: sec.length,
          noticias: noti.length,
        })
      } catch (e) {
        setContadores({ anonPend: 0, usuarios: 0, secciones: 0, noticias: 0 })
      }
    }
    cargar()
  }, [])

  return (
    <div>
      <header className="mb-3">
        <h1 className="mt-0">Panel de Administrador</h1>
        <p className="m-0 texto-secundario">Administra usuarios, secciones y supervisa denuncias y noticias.</p>
        <p className="m-0">Bienvenido: <strong>{usuarioActual?.displayName || usuarioActual?.email}</strong></p>
      </header>
      <div className="grid-tarjetas">
        <div className="tarjeta">
          <h3 className="mt-0">📣 Denuncias anónimas</h3>
          <p>Pendientes: <strong>{contadores.anonPend}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/anonimas')}>Moderar</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">👥 Usuarios</h3>
          <p>Total: <strong>{contadores.usuarios}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/usuarios')}>Gestionar</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">📚 Secciones</h3>
          <p>Total: <strong>{contadores.secciones}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/secciones')}>Abrir</Button>
          </div>
        </div>
        <div className="tarjeta">
          <h3 className="mt-0">📰 Noticias</h3>
          <p>Total: <strong>{contadores.noticias}</strong></p>
          <div>
            <Button variant="contained" color="success" onClick={() => navegar('/panel/noticias')}>Abrir</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

