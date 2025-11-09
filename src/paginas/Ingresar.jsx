import React, { useEffect, useState } from 'react'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useNavigate } from 'react-router-dom'

export default function Ingresar() {
  const { ingresar, registrar, error, usuarioActual } = useUsuario()
  const navegar = useNavigate()
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')

  async function manejarEnviar(e) {
    e.preventDefault()
    if (modo === 'login') {
      await ingresar({ correo, contrasena })
    } else {
      await registrar({ nombre, correo, contrasena, rol: 'reportero' })
    }
  }

  useEffect(() => {
    if (usuarioActual) {
      navegar('/panel')
    }
  }, [usuarioActual, navegar])

  return (
    <div className="contenedor-pequenio">
      <h1 className="mt-0">{modo === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
      <form onSubmit={manejarEnviar} className="form-grid">
        {modo === 'registro' && (
          <div className="mb-3">
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              className="w-100"
            />
          </div>
        )}
        <div className="mb-3">
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            placeholder="tu@correo.com"
            className="w-100"
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            minLength={6}
            className="w-100"
          />
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div className="acciones-linea">
          <button type="submit">
            {modo === 'login' ? 'Ingresar' : 'Registrarme'}
          </button>
        </div>
      </form>
      <div className="mt-3">
        {modo === 'login' ? (
          <button onClick={() => setModo('registro')}>Crear una cuenta</button>
        ) : (
          <button onClick={() => setModo('login')}>Ya tengo cuenta</button>
        )}
      </div>
    </div>
  )
}

