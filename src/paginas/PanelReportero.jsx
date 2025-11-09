import React from 'react'
import { Button, Grid, Card, CardContent, CardActions } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'

export default function PanelReportero() {
  const navegar = useNavigate()
  const { usuarioActual } = useUsuario()

  return (
    <div>
      <h1>Panel de Reportero</h1>
      <p>Bienvenido: <strong>{usuarioActual?.displayName || usuarioActual?.email}</strong></p>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <h3 style={{ marginTop: 0 }}>Anónimas aceptadas</h3>
              <p>Desarrolla denuncias aceptadas a noticia.</p>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={() => navegar('/panel/anonimas/aceptadas')}>Abrir</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <h3 style={{ marginTop: 0 }}>Mis noticias</h3>
              <p>Gestiona tus noticias en proceso.</p>
            </CardContent>
            <CardActions>
              <Button variant="contained" onClick={() => navegar('/panel/noticias')}>Abrir</Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <h3 style={{ marginTop: 0 }}>Nueva noticia</h3>
              <p>Crea una noticia en estado edición o terminado.</p>
            </CardContent>
            <CardActions>
              <Button variant="outlined" onClick={() => navegar('/panel/noticias/nueva')}>Crear</Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </div>
  )
}
