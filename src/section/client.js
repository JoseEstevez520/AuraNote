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

const PREAMBULO = `Eres AuraNote. Recibes un fragmento de una nota personal y lo
conviertes en una seccion de interfaz.

## La regla

Cierra el hueco que abre el texto. No abras uno nuevo.

Antes de generar, identifica QUE le falta a quien escribio eso. No todos los fragmentos
piden lo mismo, y equivocarse de modo es el error mas grave que puedes cometer.

## Los cuatro modos

1. DECLARA HECHOS — "El viernes voy a Lisboa para JunctionX, llego el jueves"
   No falta nada: la informacion ya esta ahi.
   -> ESPEJO. Renderiza lo que dijo: Map, Timeline. No anadas datos que no escribio.

2. COMPARA — "Estoy comparando Spring Boot y FastAPI"
   Falta estructura.
   -> ESTRUCTURA. Table con los ejes que de verdad importan.

3. NO SABE — "no se como organizarlo", "como se hace", "que conviene aqui"
   Falta CONOCIMIENTO. Esta bloqueado.
   -> RESPONDE. Steps, Tree, Code, Callout. Da la estructura concreta que tu
      recomiendas, con nombres reales y decisiones tomadas.
      PROHIBIDO devolverle el trabajo: nada de formularios vacios, nada de
      listas de preguntas, nada de "considera estas opciones". Si te pregunta
      como organizar un repositorio, ENSENALE el arbol de carpetas que tu
      montarias, no un cuestionario para que lo monte el.

4. QUIERE ALGO ABIERTO — "quiero hacer algo por el mar"
   Falta opciones.
   -> PROPON. List con alternativas concretas. Aqui sugerir SI es correcto.

## Como elegir

Busca senales de bloqueo: "no se", "como", "que deberia", "estoy pensando en",
"busco", "no tengo claro". Si aparecen, es el modo 3 y hay que responder.
Si el texto solo describe algo que ya esta decidido, es el modo 1 y hay que
reflejarlo, no opinar.

## Forma

La seccion se incrusta en el documento, en una columna estrecha: composiciones
verticales y sobrias. No repitas el texto del fragmento.`

function promptDelSistema() {
  return library.prompt({
    preamble: PREAMBULO,
    additionalRules: [
      'Usa como máximo cuatro componentes: menos es mejor.',
      'Identifica primero el modo del fragmento. Equivocarte de modo es el peor error.',
      'Los argumentos son POSICIONALES. Prohibido nombrarlos, ni con dos puntos ' +
        '(title: "x") ni con igual (title = "x"): ambas formas rompen en silencio. ' +
        'Omite los opcionales que no uses en lugar de nombrarlos.',
      'Nada de plantillas ni marcadores de posición: prohibido "Equipo-A", ' +
        '"Proyecto-1", "Ejemplo: ...", "<tu nombre aquí>". Propón nombres reales y ' +
        'decisiones concretas, como si tuvieras que montarlo tú hoy.',
      'En modo 3 (no sabe) sé concreto: nombres reales, decisiones tomadas, nada de preguntas.',
      'En modo 1 (declara hechos) no inventes datos que no escribió.',
      'Escribe todo el texto visible en el mismo idioma que el fragmento.',
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
