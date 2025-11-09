import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { crearDocumento, actualizarDocumento, leerDocumento } from '../servicios/firebase'
import { TextField, Button } from '@mui/material'

export default function SeccionFormulario() {
  const params = useParams()
  const navegar = useNavigate()
  const esEdicion = Boolean(params.id)

  const [valores, setValores] = useState({ nombre: '', slug: '', activa: true })
  const [estaCargando, setEstaCargando] = useState(esEdicion)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function cargar() {
      try {
        const existente = await leerDocumento('secciones', params.id)
        if (existente) {
          setValores({ nombre: existente.nombre || '', slug: existente.slug || '', activa: Boolean(existente.activa) })
        }
      } catch (e) {
        setError('No se pudo cargar la sección')
      } finally {
        setEstaCargando(false)
      }
    }
    if (esEdicion) cargar()
  }, [esEdicion, params.id])

  function manejarCambio(e) {
    const { name, value, type, checked } = e.target
    setValores((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function manejarEnviar(e) {
    e.preventDefault()
    setError(null)
    try {
      if (!valores.nombre || !valores.slug) {
        setError('Nombre y slug son obligatorios')
        return
      }
      if (esEdicion) {
        await actualizarDocumento('secciones', params.id, valores)
      } else {
        await crearDocumento('secciones', valores)
      }
      navegar('/panel/secciones')
    } catch (e) {
      setError('No se pudo guardar la sección')
    }
  }

  if (estaCargando) return <p>Cargando...</p>

  return (
    <div className="contenedor-pequenio">
      <h1 className="mt-0">{esEdicion ? 'Editar sección' : 'Nueva sección'}</h1>
      <form onSubmit={manejarEnviar} className="form-grid">
        <TextField
          label="Nombre"
          name="nombre"
          value={valores.nombre}
          onChange={manejarCambio}
          required
          placeholder="Ej. Deportes"
        />
        <TextField
          label="Slug"
          name="slug"
          value={valores.slug}
          onChange={manejarCambio}
          required
          placeholder="ej. deportes"
        />
        <label className="fila">
          <input type="checkbox" name="activa" checked={valores.activa} onChange={manejarCambio} />
          Activa
        </label>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div className="acciones-linea">
          <Button type="submit" variant="contained" color="primary">
            {esEdicion ? 'Guardar cambios' : 'Crear sección'}
          </Button>
          <Button type="button" variant="outlined" onClick={() => navegar('/panel/secciones')}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
