// Pipeline dividido: reparte el artefacto entre agentes especializados con el
// mismo modelo grande. La ilustración la hace un agente que SOLO dibuja, así
// sale más limpia que si un único prompt lo juega todo a la vez. Validado con
// A/B contra la llamada única. Ver docs/agentes.md
//
// Corre en el navegador (dev) con la clave del bundle, igual que client.js.
import { ICON_NAMES, iconSvg } from './icons.js'
import { buscarFoto, marcarUso } from '../ui/unsplash.js'

const KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'gpt-4.1'
const BASE = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'

async function chat(system, user, maxTokens) {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      ...(maxTokens ? { max_tokens: maxTokens } : {}),
      ...(/^(gpt-5|o\d)/.test(MODEL) ? {} : { temperature: 0.6 }),
    }),
  })
  if (!r.ok) {
    const t = await r.text().catch(() => '')
    throw new Error(`El modelo respondió ${r.status}. ${t.slice(0, 160)}`)
  }
  const d = await r.json()
  const c = d?.choices?.[0]?.message?.content
  if (!c) throw new Error('El modelo devolvió una respuesta vacía.')
  return c
}

const extraerSVG = (t) => (t.match(/<svg[\s\S]*?<\/svg>/i) || [null])[0]
const extraerJSON = (t) => JSON.parse((t.match(/\{[\s\S]*\}/) || ['{}'])[0])
const extraerHTML = (t) => {
  const m = t.match(/<!doctype[\s\S]*<\/html>/i) || t.match(/<html[\s\S]*<\/html>/i)
  return m ? m[0] : t.replace(/```html?|```/g, '').trim()
}

async function inlineImages(html) {
  const re = /<img[^>]*data-unsplash=["']([^"']+)["'][^>]*>/gi
  const qs = [...new Set([...html.matchAll(re)].map((m) => m[1]))]
  if (qs.length === 0) return html
  const mapa = {}
  await Promise.all(
    qs.map(async (q) => {
      const foto = await buscarFoto(q)
      if (foto) { marcarUso(foto.descarga); mapa[q] = foto }
    }),
  )
  return html.replace(re, (tag, q) => {
    const foto = mapa[q]
    if (!foto) {
      return tag.replace(/src=["'][^"']*["']/i, '').replace(/<img/i, '<div')
        .replace(/\/?>$/, ' style="background:linear-gradient(135deg,#eef2f7,#f6efe8);min-height:120px"></div>')
    }
    const alt = (tag.match(/alt=["']([^"']*)["']/i) || [, ''])[1]
    const cls = (tag.match(/class=["']([^"']*)["']/i) || [, ''])[1]
    return `<img src="${foto.url}" alt="${alt}"${cls ? ` class="${cls}"` : ''} loading="lazy" style="display:block;width:100%;height:100%;min-height:160px;object-fit:cover;border-radius:inherit">`
  })
}

function inlineIcons(html) {
  return html.replace(
    /<(?:span|i)[^>]*data-icon=["']([a-z0-9-]+)["'][^>]*><\/(?:span|i)>/gi,
    (_m, n) => iconSvg(n, 20) || '',
  )
}

export async function planificar(fragmento) {
  const sys = `Eres el director de un generador de artefactos. Lee el fragmento y
decide el plan. Responde SOLO JSON:
{ "titulo": "...", "necesita_ilustracion": true|false,
  "ilustracion": "descripción de la escena a dibujar, o null",
  "contenido": "qué texto/secciones/lógica debe tener el artefacto" }
necesita_ilustracion es true solo si el tema es visual (un ciclo, una escena, algo
físico o natural). Para datos, listas, comparaciones, planes o simulaciones es false.`
  return extraerJSON(await chat(sys, fragmento, 400))
}

async function ilustrar(descripcion) {
  const sys = `Eres un ilustrador de SVG. Dibuja UNA escena SVG rica y detallada de lo
que se te pide, y NADA más. Full color, gradientes, formas y paths a medida, capas,
profundidad. Descompón el sujeto en partes hechas de formas primitivas.
- <svg viewBox="0 0 800 H" width="100%" style="max-width:100%;height:auto">, TODAS las
  coordenadas dentro del viewBox con margen. Nada solapado; separa bien las etiquetas.
- Etiqueta las partes con <text> (min 12px, con un rect blanco detrás si va sobre color).
- Flechas: SOLO con <line>/<polyline> de stroke-width 2 y un <marker> de 8x8 definido
  UNA vez en <defs> y reutilizado (marker-end). PROHIBIDO dibujar flechas como <path> o
  <polygon> sueltos: salen triángulos negros gigantes. La punta va en el marker, nunca a mano.
Es tu única tarea: pon aquí todo tu esfuerzo. Responde SOLO con el <svg>...</svg>.`
  return extraerSVG(await chat(sys, descripcion))
}

async function maquetar(fragmento, plan, conHueco) {
  const sys = `Generas UN artefacto HTML autocontenido para AuraNote. Solo HTML, de
<!doctype html> a </html>. CSS y JS inline, sin red, sin dependencias externas.
Estética Notion sobria para el chrome; escribe el texto en el idioma del fragmento.
Usa TODO el ancho disponible (body width:100%); no dejes el contenido en una columna
estrecha pegada a la izquierda con hueco vacío. Texto largo: centrado o en columnas.
Para iconos usa <span data-icon="nombre"></span> con nombres de: ${ICON_NAMES.join(', ')}.
Para fotos usa <img data-unsplash="consulta en inglés" ...> con width/height/object-fit; el host pone el src. Úsalas cuando aporten (un lugar, un plato), sin abusar.
${conHueco ? 'Donde vaya la ilustración principal pon EXACTAMENTE <div id="ilustracion"></div> y NO la dibujes tú; el resto (texto, secciones, lógica) sí.' : 'Construye la interfaz que mejor represente la idea.'}
Cierra el <script> con:
function reportHeight(){window.parent.postMessage({type:'artifact:resize',height:document.documentElement.scrollHeight},'*');}
window.addEventListener('load',reportHeight); new ResizeObserver(reportHeight).observe(document.body);`
  const user = `FRAGMENTO: """${fragmento}"""\nPLAN: ${JSON.stringify(plan)}`
  return extraerHTML(await chat(sys, user))
}

/**
 * Genera un artefacto repartiendo el trabajo.
 * @param {string} fragmento
 * @param {'auto'|'ilustracion'} preferencia  fuerza el modo ilustración si procede
 * @returns {Promise<string>} HTML final con iconos incrustados
 */
export async function generarArtefactoDividido(fragmento, opts = {}) {
  const { preferencia = 'auto', plan: planDado = null } = opts
  const plan = planDado || (await planificar(fragmento))
  const conIlustracion =
    preferencia === 'ilustracion' || (plan.necesita_ilustracion && plan.ilustracion)

  if (!conIlustracion) {
    return inlineImages(inlineIcons(await maquetar(fragmento, plan, false)))
  }

  const descripcion = plan.ilustracion || fragmento
  const [svg, html] = await Promise.all([
    ilustrar(descripcion),
    maquetar(fragmento, plan, true),
  ])
  let final = html
  if (svg) final = final.replace(/<div[^>]*id=["']ilustracion["'][^>]*>\s*<\/div>/i, svg)
  return inlineImages(inlineIcons(final))
}
