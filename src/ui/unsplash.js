// Helper de Unsplash para las imágenes de las secciones.
//
// Las secciones se renderizan en la app (no en el iframe sandbox), así que
// pueden cargar fotos reales. Esto es lo que da el salto de calidad tipo
// OpenUI (portadas, miniaturas). Ver docs/diseno.md
//
// Caché en memoria + localStorage por consulta, para no gastar el límite
// (50 req/h en el plan de desarrollo). La clave va en el bundle en dev; en
// producción esto iría tras un proxy.
const KEY = import.meta.env.VITE_UNSPLASH_KEY || ''
const CACHE_LS = 'auranote.unsplash'

let cache = {}
try {
  cache = JSON.parse(localStorage.getItem(CACHE_LS) || '{}')
} catch {
  cache = {}
}

function guardar() {
  try {
    localStorage.setItem(CACHE_LS, JSON.stringify(cache))
  } catch {
    /* localStorage lleno: da igual */
  }
}

/**
 * Busca una foto para una consulta. Devuelve { url, thumb, autor, autorUrl,
 * descarga } o null. Hotlinkea la URL original de Unsplash (requisito).
 */
export async function buscarFoto(consulta) {
  const q = (consulta || '').trim().toLowerCase()
  if (!q || !KEY) return null
  if (cache[q]) return cache[q]

  try {
    const r = await fetch(
      `https://api.unsplash.com/search/photos?per_page=1&orientation=landscape&query=${encodeURIComponent(q)}`,
      { headers: { Authorization: `Client-ID ${KEY}` } },
    )
    if (!r.ok) return null
    const d = await r.json()
    const foto = d.results?.[0]
    if (!foto) return null
    const res = {
      url: foto.urls.regular,
      thumb: foto.urls.small,
      autor: foto.user.name,
      autorUrl: foto.user.links.html + '?utm_source=auranote&utm_medium=referral',
      descarga: foto.links.download_location,
    }
    cache[q] = res
    guardar()
    return res
  } catch {
    return null
  }
}

// Requisito de Unsplash: al usar una foto, notificar al endpoint de descarga.
export function marcarUso(descarga) {
  if (!descarga || !KEY) return
  fetch(descarga, { headers: { Authorization: `Client-ID ${KEY}` } }).catch(() => {})
}
