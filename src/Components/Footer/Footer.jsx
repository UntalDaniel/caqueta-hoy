import React from 'react'
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
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2 style={{ margin: 0, fontSize: 18 }}>Caquetá Hoy</h2>
          <p style={{ margin: 0 }}>Noticias del departamento</p>
          <small style={{ opacity: .9 }}>Hecho con React + Firebase</small>
        </div>
        <div className="footer-social">
          <p style={{ margin: 0, fontWeight: 600 }}>Síguenos</p>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61566982868031" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook" data-ver="4">
              <img src={`${import.meta.env.BASE_URL}icons/facebook.svg`} alt="Facebook" width={20} height={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Facebook
            </a>
            <a href="https://www.instagram.com/ia_asmr_dr/" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram" data-ver="4">
              <img src={`${import.meta.env.BASE_URL}icons/instagram.svg`} alt="Instagram" width={20} height={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              Instagram
            </a>
          </div>
          <small>
            📧 Contacto: <a href="mailto:contacto@caquetahoy.com" style={{ color: '#fff', textDecoration: 'underline' }}>contacto@caquetahoy.com</a>
          </small>
        </div>
        <div className="footer-anon">
          <p style={{ margin: 0, fontWeight: 600 }}>Enviar noticia anónima</p>
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
        </div>
      </div>
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <small> {new Date().getFullYear()} Caquetá Hoy</small>
          <small>Todos los derechos reservados</small>
        </div>
      </div>
    </footer>
  )
}


