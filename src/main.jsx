import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ProveedorUsuario } from './contexto/UsuarioContexto.jsx'
import { ThemeProvider, CssBaseline } from '@mui/material'
import tema from './tema.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={tema}>
        <CssBaseline />
        <ProveedorUsuario>
          <App />
        </ProveedorUsuario>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
