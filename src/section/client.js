// Cliente del Nivel 1 — la sección.
//
// Llama a OUI-1 a través de Thesys C1 (endpoint compatible con OpenAI) y
// devuelve `openui-lang`. El system prompt NO está escrito a mano: lo genera
// `library.prompt()` desde los esquemas y descripciones de src/ui/library.js,
// en el formato exacto con el que el modelo fue entrenado.
//
// Sin clave configurada entra en MODO SIMULADO y devuelve openui-lang escrito
// a mano, para poder probar el flujo entero sin cuenta ni créditos.
import { library } from '../ui/library.js'

const API_KEY = import.meta.env.VITE_C1_API_KEY || ''
const BASE_URL = import.meta.env.VITE_C1_BASE_URL || 'https://api.thesys.dev/v1/embed'
const MODEL = import.meta.env.VITE_C1_MODEL || 'thesysdev/OUI-1'

export const modoSimulado = !API_KEY

const PREAMBULO = `You are AuraNote. Someone is writing a personal note. Turn the given
fragment into the piece of interface it deserves — the kind of thing a thoughtful
designer, or Google's Disco, would build from that sentence.

Read the intent first. Ask yourself what the writer is actually missing, and build that:

  · They state plans or facts  -> show them (a place on a map, dates on a timeline).
  · They compare things        -> lay it out (a table with the axes that matter).
  · They are stuck / asking     -> answer with a concrete structure (steps, a folder
                                   tree, code, a recommendation) — real names and real
                                   decisions, never a form or a list of questions back.
  · They want ideas            -> propose concrete options.

Compose like a designer, not a form generator. You have a wide canvas (~950px), so use
the space: things that belong together go together (a map beside its suggestions, stats
in a row). Reach for what genuinely helps the reader — sometimes that is one clean
component, sometimes a small composition. Let the content decide, not a quota.

Good examples (note how the layout serves the content):

  # A trip that is already planned -> mirror it, map beside the timeline
  map   = Map("Lisboa", 12)
  plan  = Timeline([{ label: "Jueves", description: "Llegada" }, { label: "Viernes", description: "Ciudad" }])
  root  = Row([map, plan])

  # Open-ended, a place with no plan -> a map next to real suggestions
  map   = Map("Oporto", 13)
  ideas = List([{ label: "Ribeira", description: "Barrio junto al Duero" }, { label: "Librería Lello", description: "Arquitectura icónica" }])
  root  = Row([map, ideas])

  # Comparing two things -> just the table, nothing forced around it
  root  = Table(["", "Spring Boot", "FastAPI"], [["Lenguaje", "Java", "Python"], ["Arranque", "~2.5s", "~0.3s"]])

  # Doesn't know how -> answer with the structure you would build
  tree  = Tree([{ label: "clase-daw/", children: [{ label: "apuntes/" }, { label: "ejercicios/" }] }])
  tip   = Callout("Empieza en privado y abre al final de curso.")
  root  = Stack([tree, tip])

Do not repeat the fragment's text back. Make it real and specific.`

function promptDelSistema() {
  return library.prompt({
    preamble: PREAMBULO,
    additionalRules: [
      'Arguments are POSITIONAL. Never name them, neither with a colon ' +
        '(title: "x") nor with an equals sign (title = "x") - both break silently. ' +
        'Omit optional arguments you do not use instead of naming them.',
      'Real content only: no placeholders like "Team-A", "Project-1" or "Example: ...".',
      'Write all visible text in the same language as the fragment.',
    ],
  })
}

// Respuesta de ejemplo para el modo simulado. Es openui-lang real, así que
// recorre exactamente el mismo camino de render que una respuesta del modelo.
const SIMULADA = `map      = Map("Lisboa", 12)
timeline = Timeline([
             { label: "Jueves",    date: "9 oct",  description: "Llegada" },
             { label: "Viernes",   date: "10 oct", description: "Explorar la ciudad" },
             { label: "JunctionX", date: "11 oct", description: "Evento principal" }
           ])
sugs     = List([
             { label: "Paseo en barco por el Tajo", description: "Salidas desde Belém" },
             { label: "Playa de Carcavelos", description: "25 min en tren" }
           ])
root     = Stack([map, timeline, sugs])`

/**
 * Genera la sección para un fragmento.
 * @param {string} fragmento  el texto seleccionado (la intención)
 * @param {string} nota       el resto de la nota (contexto de fondo)
 * @returns {Promise<string>} openui-lang
 */
export async function generarSeccion(fragmento, nota = '') {
  if (!fragmento?.trim()) throw new Error('No hay fragmento que convertir.')

  if (modoSimulado) {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 500))
    return SIMULADA
  }

  const usuario = `FRAGMENTO SELECCIONADO (conviértelo en una sección):
"""
${fragmento}
"""

RESTO DE LA NOTA (contexto, no es lo que hay que generar):
"""
${nota || '(sin contexto adicional)'}
"""`

  let res
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: promptDelSistema() },
          { role: 'user', content: usuario },
        ],
      }),
    })
  } catch (e) {
    throw new Error(`No se pudo contactar con C1: ${e.message}`)
  }

  if (!res.ok) {
    const detalle = await res.text().catch(() => '')
    throw new Error(`C1 respondió ${res.status}. ${detalle.slice(0, 200)}`)
  }

  const datos = await res.json()
  const contenido = datos?.choices?.[0]?.message?.content
  if (!contenido?.trim()) throw new Error('C1 devolvió una respuesta vacía.')

  return limpiar(contenido)
}

// El modelo puede envolver el openui-lang en un bloque de markdown, y la
// etiqueta de lenguaje que elige es impredecible. Visto con GPT-4o: ```plaintext.
export function limpiar(bruto) {
  const cerca = bruto.match(/```[a-zA-Z-]*[ \t]*\r?\n([\s\S]*?)```/)
  return (cerca ? cerca[1] : bruto).trim()
}

export const configSeccion = { modoSimulado, modelo: MODEL, baseUrl: BASE_URL }
