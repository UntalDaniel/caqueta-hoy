import React from 'react'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useUsuario } from '../../contexto/UsuarioContexto'
import './Header.css'

export default function Header() {
  const { usuarioActual, salir } = useUsuario()
  return (
    <header className="header">
      <div className="contenedor-header">
        <div className="banner">
          <div className="barra-navegacion">
            <div className="marca">
              <h1 className="titulo-sitio m-0">Caquetá Hoy</h1>
              <p className="subtitulo-sitio m-0">Noticias y actualidad del departamento</p>
            </div>
            <div className="nav-enlaces">
              <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/">Inicio</Button>
              <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/panel">Panel</Button>
              {usuarioActual ? (
                <Button className="boton-nav" size="small" variant="outlined" color="inherit" onClick={salir}>Salir</Button>
              ) : (
                <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/ingresar">Ingresar</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


