import React from 'react'
import { Navigate } from 'react-router-dom'
import { useUsuario } from '../contexto/UsuarioContexto'

export default function RutaRol({ rolesPermitidos, children }) {
  // saco el rol del contexto
  const { rol } = useUsuario()
  // mientras carga el rol muestro algo simple
  if (!rol) return <p>Cargando...</p>
  // valido si el rol actual está permitido
  const permitido = Array.isArray(rolesPermitidos)
    ? rolesPermitidos.includes(rol)
    : rol === rolesPermitidos
  // si no tiene permiso lo mando al panel
  if (!permitido) return <Navigate to="/panel" replace />
  // si todo bien, renderizo el contenido
  return children
}
