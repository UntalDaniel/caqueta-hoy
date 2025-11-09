import { createTheme } from '@mui/material/styles'

const colores = {
  verde: '#1B5E20',
  verdeClaro: '#2E7D32',
  azulRio: '#1565C0',
  blanco: '#FFFFFF',
  negroAve: '#111111',
  cafeTronco: '#6D4C41',
  rojoCinta: '#C62828',
  amarilloOro: '#FFC107',
}

const tema = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colores.verde,
      light: colores.verdeClaro,
      contrastText: colores.blanco,
    },
    secondary: {
      main: colores.azulRio,
      contrastText: colores.blanco,
    },
    error: { main: colores.rojoCinta },
    warning: { main: colores.amarilloOro },
    info: { main: colores.azulRio },
    success: { main: colores.verdeClaro },
    background: {
      default: '#F7FAF7',
      paper: colores.blanco,
    },
    text: {
      primary: '#1F2937',
      secondary: '#4B5563',
    },
  },
  shape: { borderRadius: 10 },
})

export default tema
