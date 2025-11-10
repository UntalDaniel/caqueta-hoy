import { Routes, Route } from 'react-router-dom'
import Inicio from './paginas/Inicio'
import DetalleNoticia from './paginas/DetalleNoticia'
import SeccionPagina from './paginas/SeccionPagina'
import Ingresar from './paginas/Ingresar'
import RutaPrivada from './rutas/RutaPrivada'
import Panel from './paginas/Panel'
import SeccionesLista from './paginas/SeccionesLista'
import SeccionFormulario from './paginas/SeccionFormulario'
import NoticiasLista from './paginas/NoticiasLista'
import NoticiaFormulario from './paginas/NoticiaFormulario'
import RutaRol from './rutas/RutaRol'
import UsuariosLista from './paginas/UsuariosLista'
import Header from './Components/Header/Header'
import Footer from './Components/Footer/Footer'
import { ROLES } from './servicios/modelos'
import AnonimasModeracion from './paginas/AnonimasModeracion'
import AnonimasAceptadas from './paginas/AnonimasAceptadas'
import VideosAdmin from './paginas/VideosAdmin'
import './App.css'

function App() {
  return (
    <div className="contenedor-principal">
      <Header />
      <main className="area-principal contenedor-centro">
        {/* Rutas públicas y del panel */}
        <Routes>
          <Route path="/" element={<Inicio />} />
          {/* Sección y detalle público */}
          <Route path="/secciones/:slug" element={<SeccionPagina />} />
          <Route path="/secciones/:slug/:id" element={<DetalleNoticia />} />
          <Route path="/ingresar" element={<Ingresar />} />
          {/* Panel privado (requiere login) */}
          <Route
            path="/panel"
            element={
              <RutaPrivada>
                <Panel />
              </RutaPrivada>
            }
          />
          {/* Secciones para editor/admin */}
          <Route
            path="/panel/secciones"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.editor, ROLES.administrador]}>
                  <SeccionesLista />
                </RutaRol>
              </RutaPrivada>
            }
          />
          <Route
            path="/panel/secciones/nueva"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.editor, ROLES.administrador]}>
                  <SeccionFormulario />
                </RutaRol>
              </RutaPrivada>
            }
          />
          <Route
            path="/panel/secciones/:id"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.editor, ROLES.administrador]}>
                  <SeccionFormulario />
                </RutaRol>
              </RutaPrivada>
            }
          />
          {/* Noticias del panel (reportero puede crear/editar) */}
          <Route
            path="/panel/noticias"
            element={
              <RutaPrivada>
                <NoticiasLista />
              </RutaPrivada>
            }
          />
          <Route
            path="/panel/noticias/nueva"
            element={
              <RutaPrivada>
                <NoticiaFormulario />
              </RutaPrivada>
            }
          />
          <Route
            path="/panel/noticias/:id"
            element={
              <RutaPrivada>
                <NoticiaFormulario />
              </RutaPrivada>
            }
          />
          {/* Gestión de usuarios (solo admin) */}
          <Route
            path="/panel/usuarios"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.administrador]}>
                  <UsuariosLista />
                </RutaRol>
              </RutaPrivada>
            }
          />
          {/* Moderación de anónimas (solo admin) */}
          <Route
            path="/panel/anonimas"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.administrador]}>
                  <AnonimasModeracion />
                </RutaRol>
              </RutaPrivada>
            }
          />
          {/* Lista de anónimas aceptadas (reportero/editor/admin) */}
          <Route
            path="/panel/anonimas/aceptadas"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.reportero, ROLES.editor, ROLES.administrador]}>
                  <AnonimasAceptadas />
                </RutaRol>
              </RutaPrivada>
            }
          />
          {/* Gestión de videos del home (solo admin) */}
          <Route
            path="/panel/videos"
            element={
              <RutaPrivada>
                <RutaRol rolesPermitidos={[ROLES.administrador]}>
                  <VideosAdmin />
                </RutaRol>
              </RutaPrivada>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default App

