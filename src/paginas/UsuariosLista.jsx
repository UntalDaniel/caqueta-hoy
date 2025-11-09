import React, { useEffect, useState } from 'react'
import { listarDocumentos, actualizarDocumento } from '../servicios/firebase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Button } from '@mui/material'
import { ROLES } from '../servicios/modelos'

const LISTA_ROLES = Object.values(ROLES)

export default function UsuariosLista() {
  const { rol } = useUsuario()
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  async function cargar() {
    setError(null)
    try {
      const lista = await listarDocumentos('usuarios')
      setUsuarios(lista)
    } catch (e) {
      setError('No se pudo cargar usuarios')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cambiarRol(u, nuevoRol) {
    try {
      await actualizarDocumento('usuarios', u.id || u.uid, { rol: nuevoRol })
      setUsuarios((prev) => prev.map((x) => (x.id === (u.id || u.uid) ? { ...x, rol: nuevoRol } : x)))
    } catch (e) {
      alert('No se pudo actualizar el rol')
    }
  }

  if (cargando) return <p>Cargando usuarios...</p>

  return (
    <div>
      <h1>Usuarios</h1>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {usuarios.map((u) => (
          <div key={u.id || u.uid} style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 12 }}>
            <h3 style={{ marginTop: 0 }}>{u.nombre || u.correo || u.uid}</h3>
            <p style={{ margin: 0, color: '#4B5563' }}>{u.correo}</p>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>Rol</label>
              <select
                value={u.rol || ROLES.reportero}
                onChange={(e) => cambiarRol(u, e.target.value)}
                disabled={rol !== ROLES.administrador}
                style={{ padding: 8, width: '100%' }}
              >
                {LISTA_ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <Button size="small" disabled>Detalles</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

