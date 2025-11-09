import { AppBar, Toolbar, Typography, Container, Box, Button } from '@mui/material'
import { Link, Routes, Route } from 'react-router-dom'
import Inicio from './paginas/Inicio'
import DetalleNoticia from './paginas/DetalleNoticia'
import Ingresar from './paginas/Ingresar'
import RutaPrivada from './rutas/RutaPrivada'
import Panel from './paginas/Panel'
import { useUsuario } from './contexto/UsuarioContexto'
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

function App() {
  const { usuarioActual, salir } = useUsuario()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Header />
      <Container sx={{ py: 3 }}>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/noticia/:id" element={<DetalleNoticia />} />
          <Route path="/ingresar" element={<Ingresar />} />
          <Route
            path="/panel"
            element={
              <RutaPrivada>
                <Panel />
              </RutaPrivada>
            }
          />
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
        </Routes>
      </Container>

      <Footer />
    </Box>
  )
}

export default App
