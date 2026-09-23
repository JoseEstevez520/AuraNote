// Router — el "modelo pequeño que decide" qué generar a partir de un texto.
//
// Una sola entrada para los dos usos:
//   · Generar (exigente: false) — el usuario ya lo ha pedido; solo decide QUÉ.
//   · Sugerencias ambiente (exigente: true) — decide primero SI merece la pena
//     ofrecer algo al cerrar un párrafo; la mayoría no lo merecen.
// El conocimiento (cuándo sección, cuándo artefacto) es el mismo; solo cambia
// el umbral. Filosofía de valor (ver docs/interaccion.md):
//   · VER  — mostrar/organizar información (lugar, fechas, comparación, pasos,
//            explicación) -> SECCIÓN, con la librería de componentes.
//   · HACER / VISUAL A MEDIDA — algo que manipulas (simular, mover variables,
//            un quiz) o una ilustración/diagrama que la librería no puede
//            dibujar -> ARTEFACTO interactivo.
// No es determinista: el modelo decide caso a caso.
const KEY = import.meta.env.VITE_LLM_API_KEY || ''
const BASE = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'
const MODEL = import.meta.env.VITE_ROUTER_MODEL || 'gpt-4.1-mini'

const KINDS = ['auto', 'diagrama', 'simulacion', 'modelo', 'quiz']

const SYSTEM = `Eres el router de AuraNote, una app de notas que convierte lo que escribes
en interfaz. Recibes un texto y decides cómo darle vida. Dos caminos:

- "section": basta con MOSTRAR/organizar la información. Sirve la librería de componentes
  (mapa, línea temporal, tabla, pasos, fichas, portada con foto, lista...). Úsalo para
  lugares, planes, itinerarios, comparaciones, explicaciones, resúmenes: cosas que se
  ENTIENDEN mejor al verlas.

- "artifact": el valor está en HACER algo o en un VISUAL A MEDIDA que la librería no
  puede dar. Simuladores (mueves una variable y ves el efecto), modelos manipulables,
  tests/quizzes de repaso, o diagramas/ilustraciones a medida (el ciclo del agua, un proceso físico).
  Úsalo cuando el tema gana de verdad con interactividad o con un dibujo propio.

Ante la duda, prefiere "section": es más rápida y siempre encaja. Elige "artifact" solo
cuando la interactividad o el dibujo a medida aporten de verdad.

Además decides si el texto MERECE convertirse en interfaz ("worth"). Sé EXIGENTE: solo
merecen los que ganan de verdad al volverse interfaz (un plan, un itinerario, una
comparación, un proceso, algo con lugares/fechas/pasos/datos, o una duda que pide una
respuesta estructurada). Una frase suelta, algo trivial o una reflexión NO merecen.

Responde SOLO JSON:
{ "worth": true|false,
  "mode": "section" | "artifact",
  "kind": "auto" | "diagrama" | "simulacion" | "modelo" | "quiz",
  "label": "verbo corto en el idioma del texto, p.ej. 'ver como mapa', 'comparar', 'ver pasos'" }
kind solo importa si mode es artifact (si no, "auto").`

const POR_DEFECTO = { merece: false, mode: 'section', kind: 'auto', label: '' }

const cache = new Map() // hash de texto -> decisión, para no repetir llamadas

function hash(t) {
  let h = 0
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0
  return h
}

async function consultar(texto) {
  const h = hash(texto)
  if (cache.has(h)) return cache.get(h)

  let res = null
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
      const p = JSON.parse(d.choices[0].message.content)
      res = {
        merece: Boolean(p.worth),
        mode: p.mode === 'artifact' ? 'artifact' : 'section',
        kind: KINDS.includes(p.kind) ? p.kind : 'auto',
        label: typeof p.label === 'string' ? p.label : '',
      }
    }
  } catch {
    // silencioso: se cae al valor por defecto
  }
  // Solo se cachean respuestas buenas: un fallo de red no debe quedarse pegado.
  if (res) cache.set(h, res)
  return res
}

/**
 * Decide qué generar a partir de un texto.
 * @param {string} texto
 * @param {{ exigente?: boolean }} opciones  exigente: modo sugerencias (puede no merecer)
 * @returns {Promise<{ merece: boolean, mode: 'section'|'artifact', kind: string, label: string }>}
 */
export async function decidir(texto, { exigente = false } = {}) {
  const t = (texto || '').trim()
  if (!t || !KEY) return { ...POR_DEFECTO, merece: !exigente && Boolean(t) }
  if (exigente && t.length < 40) return POR_DEFECTO // demasiado corto para sugerir

  const r = await consultar(t)
  if (!r) return { ...POR_DEFECTO, merece: !exigente }
  if (!exigente) return { ...r, merece: true } // lo pidió el usuario: siempre merece
  // Sugerencia: sin etiqueta no hay chip que pintar.
  return r.label ? r : { ...r, merece: false }
}
