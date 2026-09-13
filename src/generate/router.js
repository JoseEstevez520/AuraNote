// Router de generación — el "modelo pequeño que decide" qué generar.
//
// Un solo gesto ("Generar") y el modelo juzga qué merece el fragmento, sin
// reglas rígidas. Filosofía de valor (ver docs/interaccion.md):
//   · VER  — mostrar/organizar información (lugar, fechas, comparación, pasos,
//            explicación) -> SECCIÓN, con la librería de componentes.
//   · HACER / VISUAL A MEDIDA — algo que manipulas (simular, mover variables,
//            un quiz) o una ilustración/diagrama que la librería no puede
//            dibujar -> ARTEFACTO interactivo.
// No es determinista: el modelo decide caso a caso.
const KEY = import.meta.env.VITE_LLM_API_KEY || ''
const BASE = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'
const MODEL = import.meta.env.VITE_ROUTER_MODEL || 'gpt-4.1-mini'

const SYSTEM = `Eres el router de AuraNote, una app de notas que convierte lo que escribes
en interfaz. Recibes un fragmento y decides cómo darle vida. Dos caminos:

- "section": basta con MOSTRAR/organizar la información. Sirve la librería de componentes
  (mapa, línea temporal, tabla, pasos, fichas, portada con foto, lista...). Úsalo para
  lugares, planes, itinerarios, comparaciones, explicaciones, resúmenes: cosas que se
  ENTIENDEN mejor al verlas.

- "artifact": el valor está en HACER algo o en un VISUAL A MEDIDA que la librería no
  puede dar. Simuladores (mueves una variable y ves el efecto), modelos manipulables,
  quizzes, o diagramas/ilustraciones a medida (el ciclo del agua, un proceso físico).
  Úsalo cuando estudiar el tema gana con interactividad o con un dibujo propio.

Ante la duda, prefiere "section": es más rápida y siempre encaja. Elige "artifact" solo
cuando la interactividad o el dibujo a medida aporten de verdad.

Responde SOLO JSON: { "mode": "section" | "artifact", "kind": "auto" | "diagrama" | "simulacion" | "modelo" }
kind solo importa si mode es artifact (si no, "auto").`

export async function clasificar(fragmento) {
  const texto = (fragmento || '').trim()
  if (!texto) return { mode: 'section', kind: 'auto' }
  if (!KEY) return { mode: 'section', kind: 'auto' }

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
    if (!r.ok) return { mode: 'section', kind: 'auto' }
    const d = await r.json()
    const p = JSON.parse(d.choices[0].message.content)
    const mode = p.mode === 'artifact' ? 'artifact' : 'section'
    const kind = ['auto', 'diagrama', 'simulacion', 'modelo'].includes(p.kind) ? p.kind : 'auto'
    return { mode, kind }
  } catch {
    return { mode: 'section', kind: 'auto' }
  }
}
