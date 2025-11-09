import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { crearDocumento, actualizarDocumento, leerDocumento } from '../servicios/firebase'
import { Paper, Stack, TextField, Button, FormControlLabel, Checkbox, Typography } from '@mui/material'

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
    <Paper sx={{ maxWidth: 520, p: 2 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {esEdicion ? 'Editar sección' : 'Nueva sección'}
      </Typography>
      <Stack component="form" spacing={2} onSubmit={manejarEnviar}>
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
        <FormControlLabel
          control={<Checkbox checked={valores.activa} name="activa" onChange={manejarCambio} />}
          label="Activa"
        />
        {error && <Typography color="error">{error}</Typography>}
        <Stack direction="row" spacing={1}>
          <Button type="submit" variant="contained" color="primary">
            {esEdicion ? 'Guardar cambios' : 'Crear sección'}
          </Button>
          <Button type="button" variant="outlined" onClick={() => navegar('/panel/secciones')}>
            Cancelar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}
