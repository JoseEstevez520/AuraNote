// Cliente de OmniSVG — modelo pequeño especializado (4B/8B, Apache 2.0) que
// genera SVG a partir de texto. Se llama a través de su Space de HuggingFace
// (ZeroGPU, gratis). Es el "GLiNER de los SVG": una tarea, un modelo pequeño.
//
// La API de gradio va en dos pasos: POST devuelve un event_id, y un GET al
// mismo endpoint con ese id devuelve el resultado por SSE.
//
// Requiere HF_TOKEN en el entorno. Ver docs/arquitectura.md
const SPACE = 'https://omnisvg-omnisvg-3b.hf.space'
const ENDPOINT = '/gradio_api/call/gradio_text_to_svg'
const HF_TOKEN = process.env.HF_TOKEN || ''

// Extrae el primer <svg>...</svg> de un texto.
export function extraerSVG(texto) {
  const m = texto.match(/<svg[\s\S]*?<\/svg>/i)
  return m ? m[0] : null
}

/**
 * Genera un SVG a partir de una descripción.
 * @param {string} descripcion  qué dibujar (en inglés rinde mejor)
 * @param {object} opts  { modelSize '4B'|'8B', temperature, maxLength }
 * @returns {Promise<string>} el SVG, o lanza error
 */
export async function textoASVG(descripcion, opts = {}) {
  if (!HF_TOKEN) throw new Error('Falta HF_TOKEN en el entorno.')
  const {
    modelSize = '4B',
    temperature = 0.5,
    topP = 0.88,
    topK = 50,
    repetitionPenalty = 1.05,
    maxLength = 512,
  } = opts

  const headers = {
    Authorization: `Bearer ${HF_TOKEN}`,
    'Content-Type': 'application/json',
  }
  const body = JSON.stringify({
    data: [descripcion, modelSize, 1, temperature, topP, topK, repetitionPenalty, maxLength],
  })

  const post = await fetch(`${SPACE}${ENDPOINT}`, { method: 'POST', headers, body })
  if (!post.ok) throw new Error(`OmniSVG POST ${post.status}: ${await post.text().catch(() => '')}`)
  const { event_id } = await post.json()
  if (!event_id) throw new Error('OmniSVG no devolvió event_id.')

  // GET con SSE: leemos hasta el evento "complete".
  const res = await fetch(`${SPACE}${ENDPOINT}/${event_id}`, { headers })
  if (!res.ok) throw new Error(`OmniSVG GET ${res.status}`)
  const texto = await res.text()

  // El SSE trae varios "event:"/"data:"; buscamos el bloque completo.
  const idx = texto.lastIndexOf('event: complete')
  if (idx === -1) {
    if (texto.includes('event: error')) throw new Error('OmniSVG devolvió error en el stream.')
    throw new Error('OmniSVG no completó (timeout o cola).')
  }
  const dataLinea = texto.slice(idx).split('\n').find((l) => l.startsWith('data:'))
  if (!dataLinea) throw new Error('OmniSVG: sin data en complete.')
  const arr = JSON.parse(dataLinea.slice(5).trim())
  // arr[1] es el SVG (o SVGs) en crudo; arr[0] es una preview HTML.
  const svg = extraerSVG(arr[1] || arr[0] || '')
  if (!svg) throw new Error('OmniSVG: no se encontró SVG en la respuesta.')
  return svg
}
