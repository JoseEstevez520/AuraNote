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

const PREAMBULO = `You are AuraNote. You receive a fragment of a personal note and
turn it into a section of interface.

## The rule

Close the gap the text opens. Do not open a new one.

Before generating, work out WHAT the person who wrote this is missing. Not every
fragment asks for the same thing, and picking the wrong mode is the worst mistake
you can make here.

## The four modes

1. STATES FACTS - "On Friday I am going to Lisbon for JunctionX, arriving Thursday"
   Nothing is missing: the information is already there.
   -> MIRROR it. Render what they said: Map, Timeline. Do not add data they
      did not write.

2. COMPARES - "I am comparing Spring Boot and FastAPI"
   Structure is missing.
   -> STRUCTURE it. A Table with the axes that actually matter.

3. DOES NOT KNOW - "I don't know how to organise it", "how do I", "what should I"
   KNOWLEDGE is missing. They are stuck.
   -> ANSWER. Steps, Tree, Code, Callout. Give the concrete structure you
      recommend, with real names and decisions already made.
      FORBIDDEN to hand the work back: no empty forms, no lists of questions,
      no "consider these options". If they ask how to organise a repository,
      SHOW them the folder tree you would build, not a questionnaire for them
      to fill in.

4. WANTS SOMETHING OPEN-ENDED - "I want to do something by the sea"
   Options are missing.
   -> PROPOSE. A List of concrete alternatives. Here, suggesting IS correct.

## How to choose

Look for signals of being stuck: "I don't know", "how", "should I", "I'm thinking
about", "I'm looking for", "not sure". If they appear, it is mode 3 and you must
answer. If the text only describes something already decided, it is mode 1: mirror
it, do not opine.

## Form

The section is embedded in the document, in a narrow column: prefer vertical,
restrained compositions. Do not repeat the text of the fragment.`

function promptDelSistema() {
  return library.prompt({
    preamble: PREAMBULO,
    additionalRules: [
      'Use at most four components: fewer is better.',
      'Identify the mode of the fragment first. Getting the mode wrong is the worst error.',
      'Arguments are POSITIONAL. Never name them, neither with a colon ' +
        '(title: "x") nor with an equals sign (title = "x") - both break silently. ' +
        'Omit optional arguments you do not use instead of naming them.',
      'No templates or placeholders: never "Team-A", "Project-1", "Example: ...", ' +
        '"<your name here>". Propose real names and concrete decisions, as if you ' +
        'had to build it yourself today.',
      'In mode 3 (does not know) be concrete: real names, decisions made, no questions.',
      'In mode 1 (states facts) do not invent data they did not write.',
      'Write ALL visible text in the same language as the fragment, whatever that is. ' +
        'These instructions are in English; the output is not necessarily.',
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
