import React, { useEffect, useState } from 'react'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useNavigate } from 'react-router-dom'

export default function Ingresar() {
  const { ingresar, registrar, error, usuarioActual } = useUsuario()
  const navegar = useNavigate()
  const [modo, setModo] = useState('login') // 'login' | 'registro'
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
    <div style={{ maxWidth: 420 }}>
      <h1>{modo === 'login' ? 'Ingresar' : 'Crear cuenta'}</h1>
      <form onSubmit={manejarEnviar}>
        {modo === 'registro' && (
          <div style={{ marginBottom: 12 }}>
            <label>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Tu nombre"
              style={{ width: '100%', padding: 8 }}
            />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>Correo</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            placeholder="tu@correo.com"
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Contraseña</label>
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            minLength={6}
            style={{ width: '100%', padding: 8 }}
          />
        </div>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 12px' }}>
          {modo === 'login' ? 'Ingresar' : 'Registrarme'}
        </button>
      </form>
      <div style={{ marginTop: 12 }}>
        {modo === 'login' ? (
          <button onClick={() => setModo('registro')}>Crear una cuenta</button>
        ) : (
          <button onClick={() => setModo('login')}>Ya tengo cuenta</button>
        )}
      </div>
    </div>
  )
}
