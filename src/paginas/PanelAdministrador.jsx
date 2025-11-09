import React from 'react'
import { Button, Box, Card, CardContent, CardActions } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'

export default function PanelAdministrador() {
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()

  return (
    <div>
      <h1>Panel de Administrador</h1>
      <p>Bienvenido: <strong>{usuarioActual?.displayName || usuarioActual?.email}</strong></p>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Denuncias anónimas</h3>
            <p>Modera y convierte en noticia.</p>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => navegar('/panel/anonimas')}>Moderar</Button>
          </CardActions>
        </Card>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Usuarios</h3>
            <p>Cambia roles de usuarios registrados.</p>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={() => navegar('/panel/usuarios')}>Gestionar</Button>
          </CardActions>
        </Card>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Secciones</h3>
            <p>Administra secciones del sitio.</p>
          </CardContent>
          <CardActions>
            <Button onClick={() => navegar('/panel/secciones')}>Abrir</Button>
          </CardActions>
        </Card>
        <Card>
          <CardContent>
            <h3 style={{ marginTop: 0 }}>Noticias</h3>
            <p>Gestiona todas las noticias.</p>
          </CardContent>
          <CardActions>
            <Button onClick={() => navegar('/panel/noticias')}>Abrir</Button>
          </CardActions>
        </Card>
      </Box>
    </div>
  )
}
