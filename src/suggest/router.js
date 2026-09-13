// Router de sugerencias — el "modelo pequeño que decide".
//
// Dado un párrafo cerrado, decide si merece la pena ofrecer generar algo, y si
// sí, qué: una sección (nivel 1) o un artefacto (nivel 2), con una etiqueta
// corta para la pista. Usa un modelo BARATO y rápido porque corre cada vez que
// cierras un párrafo. Es la tarea de clasificación de la tesis: modelo pequeño,
// una función concreta. Ver docs/interaccion.md
const KEY = import.meta.env.VITE_LLM_API_KEY || ''
const BASE = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'
// Modelo del router: pequeño y barato, independiente del de generación.
const MODEL = import.meta.env.VITE_ROUTER_MODEL || 'gpt-4.1-mini'

const SYSTEM = `Eres el router de AuraNote, un documento que convierte texto en interfaz.
Recibes UN párrafo. Decide si vale la pena ofrecer al usuario convertirlo en algo visual
o interactivo. Sé EXIGENTE: la mayoría de los párrafos NO merecen sugerencia; solo los
que ganan de verdad al volverse interfaz (un plan, un itinerario, una comparación, un
proceso, algo con lugares/fechas/pasos/datos, o una duda que pide una respuesta
estructurada). Un párrafo trivial, una frase suelta o una reflexión NO se sugieren.

Responde SOLO JSON:
{ "suggest": true|false,
  "action": "section" | "artifact",
  "label": "verbo corto en el idioma del párrafo, p.ej. 'ver como mapa', 'comparar', 'ver pasos'" }
- section: cuando basta con componentes (mapa, timeline, tabla, pasos, fichas).
- artifact: cuando pide algo interactivo o una ilustración (simulación, diagrama, modelo).
Si suggest es false, devuelve solo { "suggest": false }.`

const cache = new Map() // hash de texto -> resultado, para no repetir llamadas

function hash(t) {
  let h = 0
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0
  return h
}

/**
 * @param {string} parrafo
 * @returns {Promise<{suggest:boolean, action?:string, label?:string}>}
 */
export async function enrutar(parrafo) {
  const texto = (parrafo || '').trim()
  if (!KEY) return { suggest: false } // sin clave, no hay sugerencias
  if (texto.length < 40) return { suggest: false } // demasiado corto
  const h = hash(texto)
  if (cache.has(h)) return cache.get(h)

  let res = { suggest: false }
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: texto },
        ],
        temperature: 0,
        response_format: { type: 'json_object' },
      }),
    })
    if (r.ok) {
      const d = await r.json()
      const parsed = JSON.parse(d.choices[0].message.content)
      if (parsed.suggest && parsed.action && parsed.label) res = parsed
    }
  } catch {
    // silencioso: una sugerencia que falla no debe molestar
  }
  cache.set(h, res)
  return res
}
