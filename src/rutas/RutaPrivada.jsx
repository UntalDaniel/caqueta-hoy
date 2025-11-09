import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'
import { CircularProgress } from '@mui/material'

export default function RutaPrivada({ children }) {
  const { usuarioActual, estaCargando } = useUsuario()

  if (estaCargando)
    return (
      <div className="centrado-carga">
        <CircularProgress />
      </div>
    )
  if (!usuarioActual) return <Navigate to="/ingresar" replace />
  return children
}
