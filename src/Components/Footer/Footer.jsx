import React from 'react'
import { Box, Container, Typography } from '@mui/material'
import { Link } from 'react-router-dom'
import './Footer.css'
import { useState } from 'react'
import { crearDocumento, subirArchivo } from '../../servicios/firebase'

export default function Footer() {
  const [texto, setTexto] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function manejarEnviar(e) {
    e.preventDefault()
    setMensaje('')
    if (!texto.trim()) {
      setMensaje('Por favor escribe la información de la noticia anónima.')
      return
    }
    setEnviando(true)
    try {
      let evidenciaUrl = ''
      if (archivo) {
        try {
          const ruta = `anonimas/${Date.now()}_${archivo.name}`
          evidenciaUrl = await subirArchivo(ruta, archivo)
        } catch (err) {
          // Si las reglas de Storage no permiten anónimo, continuamos sin evidencia
          setMensaje('No se pudo subir la evidencia. Se enviará solo el texto.')
        }
      }
      await crearDocumento('anonimas', {
        texto: texto.trim(),
        evidenciaUrl,
        estado: 'pendiente',
      })
      setTexto('')
      setArchivo(null)
      setMensaje('Gracias. Tu denuncia anónima fue enviada para revisión.')
    } catch (err) {
      setMensaje('No se pudo enviar. Intenta de nuevo más tarde.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Box component="footer" className="footer">
      <Container className="footer-container">
        <Box className="footer-brand">
          <Typography variant="h6">Caquetá Hoy</Typography>
          <Typography variant="body2">Noticias del departamento</Typography>
          <Typography variant="body2">Hecho con React + Firebase</Typography>
        </Box>
        <Box className="footer-social">
          <Typography variant="subtitle2">Síguenos</Typography>
          <div className="social-links">
            <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
            <a href="https://x.com/" target="_blank" rel="noreferrer">X</a>
          </div>
          <Typography variant="caption">Contacto: contacto@caquetahoy.com</Typography>
        </Box>
        <Box className="footer-anon">
          <Typography variant="subtitle2">Enviar noticia anónima</Typography>
          <form onSubmit={manejarEnviar} className="anon-form">
            <textarea
              placeholder="Cuéntanos lo que sabes..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={3}
            />
            <div className="anon-actions">
              <label className="anon-file">
                Evidencia (opcional):
                <input type="file" onChange={(e) => setArchivo(e.target.files?.[0] || null)} />
              </label>
              <button type="submit" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar'}</button>
            </div>
            {mensaje && <p className="anon-msg">{mensaje}</p>}
          </form>
        </Box>
      </Container>
      <Box className="footer-bottom">
        <Container className="footer-bottom-inner">
          <Typography variant="caption"> {new Date().getFullYear()} Caquetá Hoy</Typography>
          <Typography variant="caption">Todos los derechos reservados</Typography>
        </Container>
      </Box>
    </Box>
  )
}

