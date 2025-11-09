import React, { useEffect, useState } from 'react'
import { listarDocumentos, actualizarDocumento } from '../servicios/firebase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Box, Card, CardContent, CardActions, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material'
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
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
        {usuarios.map((u) => (
          <Card key={u.id || u.uid}>
            <CardContent>
              <h3 style={{ marginTop: 0 }}>{u.nombre || u.correo || u.uid}</h3>
              <p style={{ margin: 0, color: '#4B5563' }}>{u.correo}</p>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Rol</InputLabel>
                <Select
                  label="Rol"
                  value={u.rol || ROLES.reportero}
                  onChange={(e) => cambiarRol(u, e.target.value)}
                  disabled={rol !== ROLES.administrador}
                >
                  {LISTA_ROLES.map((r) => (
                    <MenuItem key={r} value={r}>{r}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </CardContent>
            <CardActions>
              <Button size="small" disabled>Detalles</Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </div>
  )
}
