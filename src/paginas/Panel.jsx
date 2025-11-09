import React from 'react'
import { useUsuario } from '../contexto/UsuarioContexto'
import PanelReportero from './PanelReportero'
import PanelEditor from './PanelEditor'
import PanelAdministrador from './PanelAdministrador'

export default function Panel() {
  const { usuarioActual, rol } = useUsuario()
  if (!usuarioActual || !rol) return <p>Cargando...</p>
  if (rol === 'administrador') return <PanelAdministrador />
  if (rol === 'editor') return <PanelEditor />
  return <PanelReportero />
}
