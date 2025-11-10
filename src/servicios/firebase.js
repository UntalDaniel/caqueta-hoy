import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, limit, startAfter } from 'firebase/firestore'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// config de firebase (variables del .env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// listado paginado de anónimas (con filtro por estado)
export async function listarAnonimas({ estado, tam = 20, cursor = null } = {}) {
  const colRef = collection(db, 'anonimas')
  const filtros = []
  if (estado) filtros.push(where('estado', '==', estado))
  let q = filtros.length ? query(colRef, ...filtros, orderBy('fechaCreacion', 'desc'), limit(tam)) : query(colRef, orderBy('fechaCreacion', 'desc'), limit(tam))
  if (cursor) q = filtros.length ? query(colRef, ...filtros, orderBy('fechaCreacion', 'desc'), startAfter(cursor), limit(tam)) : query(colRef, orderBy('fechaCreacion', 'desc'), startAfter(cursor), limit(tam))
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const ultimo = snap.docs[snap.docs.length - 1] || null
  return { items, cursor: ultimo }
}

// inicializaciones
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// auth helpers
export function observarAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function cerrarSesion() {
  await signOut(auth)
}

// registro con correo y guardado del rol en usuarios
export async function registrarConCorreo({ nombre, correo, contrasena, rol = 'reportero' }) {
  const cred = await createUserWithEmailAndPassword(auth, correo, contrasena)
  if (nombre) {
    await updateProfile(cred.user, { displayName: nombre })
  }
  await setDoc(doc(db, 'usuarios', cred.user.uid), {
    uid: cred.user.uid,
    nombre: nombre || '',
    correo,
    rol,
    fechaCreacion: serverTimestamp(),
  })
  return cred.user
}

export async function iniciarSesionConCorreo({ correo, contrasena }) {
  const cred = await signInWithEmailAndPassword(auth, correo, contrasena)
  return cred.user
}

// lee el documento de usuario para saber el rol
export async function obtenerRolUsuario(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid))
  if (snap.exists()) {
    return snap.data().rol || 'reportero'
  }
  return 'reportero'
}

// CRUD genérico
export async function crearDocumento(nombreColeccion, datos) {
  const colRef = collection(db, nombreColeccion)
  const docRef = await addDoc(colRef, {
    ...datos,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  })
  return docRef.id
}

export async function leerDocumento(nombreColeccion, id) {
  const docRef = doc(db, nombreColeccion, id)
  const snap = await getDoc(docRef)
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function listarDocumentos(nombreColeccion) {
  const colRef = collection(db, nombreColeccion)
  const snap = await getDocs(colRef)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function actualizarDocumento(nombreColeccion, id, datos) {
  const docRef = doc(db, nombreColeccion, id)
  await updateDoc(docRef, { ...datos, fechaActualizacion: serverTimestamp() })
}

export async function eliminarDocumento(nombreColeccion, id) {
  const docRef = doc(db, nombreColeccion, id)
  await deleteDoc(docRef)
}

// subir archivo a storage y devolver url pública
export async function subirArchivo(rutaDestino, archivo) {
  const archivoRef = ref(storage, rutaDestino)
  await uploadBytes(archivoRef, archivo)
  const url = await getDownloadURL(archivoRef)
  return url
}

// listado de noticias publicadas con filtros
export async function listarNoticiasPublicadas({ seccionId, municipio, tam = 9, cursor = null } = {}) {
  const colRef = collection(db, 'noticias')
  const filtros = [where('estado', '==', 'publicado')]
  if (seccionId && seccionId !== 'todas') filtros.push(where('seccionId', '==', seccionId))
  if (municipio && municipio !== 'todos') filtros.push(where('municipio', '==', municipio))
  let q = query(colRef, ...filtros, orderBy('fechaCreacion', 'desc'), limit(tam))
  if (cursor) q = query(colRef, ...filtros, orderBy('fechaCreacion', 'desc'), startAfter(cursor), limit(tam))
  const snap = await getDocs(q)
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const ultimo = snap.docs[snap.docs.length - 1] || null
  return { items, cursor: ultimo }
}

// noticias por autor (para el panel)
export async function listarNoticiasPorAutor(uid) {
  const colRef = collection(db, 'noticias')
  const q = query(colRef, where('autorUid', '==', uid))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
