import React, { createContext, useContext, useEffect, useState } from 'react'
import { observarAuth, cerrarSesion, registrarConCorreo, iniciarSesionConCorreo, obtenerRolUsuario, db } from '../servicios/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

// contexto global para el usuario (auth + rol)
const ContextoUsuario = createContext(null)

export function ProveedorUsuario({ children }) {
  // estados básicos del usuario
  const [usuarioActual, setUsuarioActual] = useState(null)
  const [rol, setRol] = useState(null)
  const [estaCargando, setEstaCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // me suscribo a auth y luego al doc del rol
    let unsubRol = null
    const unsubAuth = observarAuth(async (usuario) => {
      setUsuarioActual(usuario)
      if (unsubRol) {
        unsubRol()
        unsubRol = null
      }
      if (usuario) {
        // rol en tiempo real desde firestore
        unsubRol = onSnapshot(doc(db, 'usuarios', usuario.uid), (snap) => {
          const rolActual = snap.exists() ? snap.data().rol || 'reportero' : 'reportero'
          setRol(rolActual)
          setEstaCargando(false)
        }, () => {
          // si falla el snapshot, consulto una vez
          obtenerRolUsuario(usuario.uid).then((r) => setRol(r)).finally(() => setEstaCargando(false))
        })
      } else {
        // no hay usuario
        setRol(null)
        setEstaCargando(false)
      }
    })
    // limpio las suscripciones cuando cambia o desmonta
    return () => {
      unsubAuth && unsubAuth()
      unsubRol && unsubRol()
    }
  }, [])

  async function registrar({ nombre, correo, contrasena, rol = 'reportero' }) {
    // registro con correo y guardo rol por defecto
    setError(null)
    try {
      await registrarConCorreo({ nombre, correo, contrasena, rol })
    } catch (e) {
      setError('No se pudo registrar')
    }
  }

  async function ingresar({ correo, contrasena }) {
    // login simple con correo
    setError(null)
    try {
      await iniciarSesionConCorreo({ correo, contrasena })
    } catch (e) {
      setError('No se pudo iniciar sesión')
    }
  }

  async function salir() {
    // cerrar sesión
    setError(null)
    try {
      await cerrarSesion()
    } catch (e) {
      setError('No se pudo cerrar sesión')
    }
  }

  // valores que comparto al resto de la app
  const valor = { usuarioActual, rol, estaCargando, error, registrar, ingresar, salir }
  return <ContextoUsuario.Provider value={valor}>{children}</ContextoUsuario.Provider>
}

export function useUsuario() {
  // hook para usar el contexto sin repetir código
  return useContext(ContextoUsuario)
}
