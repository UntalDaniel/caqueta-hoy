import React, { createContext, useContext, useEffect, useState } from 'react'
import { observarAuth, cerrarSesion, registrarConCorreo, iniciarSesionConCorreo, obtenerRolUsuario, db } from '../servicios/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

const ContextoUsuario = createContext(null)

export function ProveedorUsuario({ children }) {
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [rol, setRol] = useState(null)
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let unsubRol = null
    const unsubAuth = observarAuth(async (usuario) => {
      setUsuarioActual(usuario)
      // limpiar suscripción previa
      if (unsubRol) {
        unsubRol()
        unsubRol = null
      }
      if (usuario) {
        // Suscribirse al documento de usuario para rol en tiempo real
        unsubRol = onSnapshot(doc(db, 'usuarios', usuario.uid), (snap) => {
          const rolActual = snap.exists() ? snap.data().rol || 'reportero' : 'reportero'
          setRol(rolActual)
          setEstaCargando(false)
        }, () => {
          // fallback si falla la suscripción: leer una vez
          obtenerRolUsuario(usuario.uid).then((r) => setRol(r)).finally(() => setEstaCargando(false))
        })
      } else {
        setRol(null)
        setEstaCargando(false)
      }
    })
    return () => {
      unsubAuth && unsubAuth()
      unsubRol && unsubRol()
    }
  }, [])

  async function registrar({ nombre, correo, contrasena, rol = 'reportero' }) {
    setError(null)
    try {
      await registrarConCorreo({ nombre, correo, contrasena, rol })
    } catch (e) {
      setError('No se pudo registrar')
    }
  }

  async function ingresar({ correo, contrasena }) {
    setError(null)
    try {
      await iniciarSesionConCorreo({ correo, contrasena })
    } catch (e) {
      setError('No se pudo iniciar sesión')
    }
  }

  async function salir() {
    setError(null)
    try {
      await cerrarSesion()
    } catch (e) {
      setError('No se pudo cerrar sesión')
    }
  }

  const valor = { usuarioActual, rol, estaCargando, error, registrar, ingresar, salir }
  return <ContextoUsuario.Provider value={valor}>{children}</ContextoUsuario.Provider>
}

export function useUsuario() {
  return useContext(ContextoUsuario)
}
