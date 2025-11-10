import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarDocumentos, eliminarDocumento } from '../servicios/firebase'
import { Button } from '@mui/material'
import { slugify } from '../servicios/slug'

export default function SeccionesLista() {
  // estados básicos
  const [secciones, setSecciones] = useState([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)
  const navegar = useNavigate()

  // traigo todas las secciones
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

  // eliminar una sección
  async function eliminarSeccion(id) {
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
      <header className="mb-3">
        <h1 className="mt-0">Secciones</h1>
        <p className="m-0 texto-secundario">Administra las categorías visibles en el sitio.</p>
      </header>
      <div className="mb-2">
        <Button variant="contained" color="success" onClick={() => navegar('/panel/secciones/nueva')}>Nueva sección</Button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {secciones.length === 0 ? (
        <p>No hay secciones</p>
      ) : (
        <div className="grid-tarjetas">
          {secciones.map((s) => (
            <div key={s.id} className="tarjeta">
              <h3 className="mt-0">{s.nombre}</h3>
              <p className="m-0 texto-pequenio texto-secundario">Slug: {s.slug || slugify(s.nombre || '')}</p>
              <p className="m-0 texto-pequenio texto-secundario">Activa: {String(s.activa)}</p>
              {/* acciones: editar, eliminar y ver pública */}
              <div className="acciones-linea mt-2">
                <Button size="small" onClick={() => navegar(`/panel/secciones/${s.id}`)}>Editar</Button>
                <Button size="small" color="error" onClick={() => eliminarSeccion(s.id)}>Eliminar</Button>
                <Button
                  size="small"
                  component="a"
                  href={`/secciones/${s.slug || slugify(s.nombre || '')}`}
                  target="_blank"
                  rel="noopener"
                >
                  Ver pública
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
