// Pipeline dividido (experimento): en vez de una sola llamada que hace todo,
// separamos el trabajo entre agentes especializados con el MISMO modelo grande.
//
//   1. DIRECTOR   -> plan JSON: ¿hace falta ilustración? ¿de qué?
//   2. ILUSTRADOR -> dibuja SOLO el SVG, a fondo, sin distraerse con el resto
//   3. MAQUETADOR -> HTML con el texto/lógica y un hueco para la ilustración
//   4. ENSAMBLADOR-> mete el SVG en el hueco
//
// Hipótesis: cada agente, al centrarse en una sola cosa, la hace mejor que un
// único prompt que lo juega todo a la vez. Se valida con A/B. Ver docs/agentes.md
const KEY = process.env.VITE_LLM_API_KEY
const MODEL = process.env.VITE_LLM_MODEL || 'gpt-4.1'
const BASE = process.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'

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
  if (!r.ok) throw new Error(`${r.status}: ${await r.text().catch(() => '')}`)
  const d = await r.json()
  return d.choices[0].message.content
}

const extraerSVG = (t) => (t.match(/<svg[\s\S]*?<\/svg>/i) || [null])[0]
const extraerJSON = (t) => JSON.parse((t.match(/\{[\s\S]*\}/) || ['{}'])[0])
const extraerHTML = (t) => {
  const m = t.match(/<!doctype[\s\S]*<\/html>/i) || t.match(/<html[\s\S]*<\/html>/i)
  return m ? m[0] : t.replace(/```html?|```/g, '').trim()
}

// 1. Director
async function planificar(fragmento) {
  const sys = `Eres el director de un generador de artefactos. Lee el fragmento y
decide el plan. Responde SOLO JSON:
{ "titulo": "...", "necesita_ilustracion": true|false,
  "ilustracion": "descripción de la escena a dibujar, o null",
  "contenido": "qué texto/secciones/lógica debe tener el artefacto" }
necesita_ilustracion es true solo si el tema es visual (un ciclo, una escena, algo
físico). Para datos/listas/comparaciones es false.`
  return extraerJSON(await chat(sys, fragmento, 400))
}

// 2. Ilustrador — solo el SVG, a fondo
async function ilustrar(descripcion) {
  const sys = `Eres un ilustrador de SVG. Dibuja UNA escena SVG rica y detallada de lo
que se te pide, y NADA más. Full color, gradientes, formas y paths a medida, capas,
profundidad. Descompón el sujeto en partes hechas de formas primitivas.
- <svg viewBox="0 0 800 H" width="100%" style="max-width:100%;height:auto">, todas las
  coordenadas dentro del viewBox con margen, nada solapado.
- Etiqueta las partes con <text> (min 12px) y usa flechas de color con un <marker>.
Es tu única tarea: pon aquí todo tu esfuerzo. Responde SOLO con el <svg>...</svg>.`
  return extraerSVG(await chat(sys, descripcion, 3000))
}

// 3. Maquetador — HTML con hueco para la ilustración
async function maquetar(fragmento, plan, conHueco) {
  const sys = `Generas UN artefacto HTML autocontenido para AuraNote. Solo HTML, de
<!doctype html> a </html>. CSS y JS inline, sin red, sin dependencias.
Estética Notion sobria para el chrome; texto en el idioma del fragmento.
Para iconos usa <span data-icon="nombre"></span> (el host los inyecta).
${conHueco ? 'Donde vaya la ilustración principal, pon EXACTAMENTE: <div id="ilustracion"></div> — no la dibujes tú.' : ''}
Incluye al final el reporte de altura:
function reportHeight(){window.parent.postMessage({type:'artifact:resize',height:document.documentElement.scrollHeight},'*');}
window.addEventListener('load',reportHeight); new ResizeObserver(reportHeight).observe(document.body);`
  const user = `FRAGMENTO: """${fragmento}"""\nPLAN: ${JSON.stringify(plan)}`
  return extraerHTML(await chat(sys, user, 4000))
}

// Pipeline completo dividido
export async function generarDividido(fragmento) {
  const plan = await planificar(fragmento)
  let svg = null
  let html
  if (plan.necesita_ilustracion && plan.ilustracion) {
    // Ilustrador y maquetador en paralelo
    ;[svg, html] = await Promise.all([
      ilustrar(plan.ilustracion),
      maquetar(fragmento, plan, true),
    ])
    if (svg) html = html.replace(/<div id=["']ilustracion["']><\/div>/i, svg)
  } else {
    html = await maquetar(fragmento, plan, false)
  }
  return { html, plan, tieneSVG: Boolean(svg) }
}
