import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarDocumentos, eliminarDocumento } from '../servicios/firebase'

export default function SeccionesLista() {
  const [secciones, setSecciones] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const navegar = useNavigate()

  async function cargar() {
    setError(null)
    try {
      const datos = await listarDocumentos('secciones')
      setSecciones(datos)
    } catch (e) {
      setError('No se pudo cargar secciones (verifica Firestore)')
    } finally {
      setEstaCargando(false)
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function manejarEliminar(id) {
    const ok = confirm('¿Eliminar esta sección?')
    if (!ok) return
    try {
      await eliminarDocumento('secciones', id)
      setSecciones((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      alert('No se pudo eliminar')
    }
  }

  if (estaCargando) return <p>Cargando secciones...</p>

  return (
    <div>
      <h1>Secciones</h1>
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => navegar('/panel/secciones/nueva')}>Nueva sección</button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {secciones.length === 0 ? (
        <p>No hay secciones</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Activa</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {secciones.map((s) => (
              <tr key={s.id}>
                <td>{s.nombre}</td>
                <td>{s.slug}</td>
                <td>{String(s.activa)}</td>
                <td>
                  <Link to={`/panel/secciones/${s.id}`}>Editar</Link>{' '}
                  <button onClick={() => manejarEliminar(s.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
