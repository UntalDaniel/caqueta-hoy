import React from 'react'
import { Box, Container, Typography, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { useUsuario } from '../../contexto/UsuarioContexto'
import './Header.css'

export default function Header() {
  const { usuarioActual, salir } = useUsuario()
  return (
    <Box component="header" className="header" sx={{ bgcolor: 'transparent' }}>
      <Container className="contenedor-header" sx={{ p: 0 }}>
        <Box className="banner" sx={{
          p: 2,
          borderRadius: 2,
          mb: 2,
          color: 'white',
          background: 'linear-gradient(90deg, #166534, #1D4ED8)'
        }}>
          <Box className="barra-navegacion" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box className="marca">
              <Typography className="titulo-sitio" variant="h4" sx={{ fontWeight: 700, m: 0 }}>Caquetá Hoy</Typography>
              <Typography className="subtitulo-sitio" variant="body1" sx={{ opacity: 0.9, m: 0 }}>Noticias y actualidad del departamento</Typography>
            </Box>
            <Box className="nav-enlaces" sx={{ display: 'flex', gap: 1 }}>
              <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/">Inicio</Button>
              <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/panel">Panel</Button>
              {usuarioActual ? (
                <Button className="boton-nav" size="small" variant="outlined" color="inherit" onClick={salir}>Salir</Button>
              ) : (
                <Button className="boton-nav" size="small" variant="outlined" color="inherit" component={Link} to="/ingresar">Ingresar</Button>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

