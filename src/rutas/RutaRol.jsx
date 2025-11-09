import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'

export default function RutaRol({ rolesPermitidos, children }) {
  const { rol } = useUsuario()
  if (!rol) return <p>Cargando...</p>
  const permitido = Array.isArray(rolesPermitidos)
    ? rolesPermitidos.includes(rol)
    : rol === rolesPermitidos
  if (!permitido) return <Navigate to="/panel" replace />
  return children
}
