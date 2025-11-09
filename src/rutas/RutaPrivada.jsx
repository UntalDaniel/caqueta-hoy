import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Box, CircularProgress } from '@mui/material'

export default function RutaPrivada({ children }) {
  const { usuarioActual, estaCargando } = useUsuario()

  if (estaCargando)
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  if (!usuarioActual) return <Navigate to="/ingresar" replace />
  return children
}
