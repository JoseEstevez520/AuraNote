// Cliente del modelo grande para el Nivel 2 — el artefacto.
//
// Endpoint compatible con OpenAI (chat completions), configurable por
// variables de entorno. El modelo concreto está sin decidir a propósito:
// cambiarlo es cuestión de tocar .env, no código.
//
// Si no hay clave configurada, el cliente entra en MODO SIMULADO: devuelve
// un HTML de ejemplo tras un retardo realista, para poder probar todo el
// flujo (generación, iframe, persistencia) sin gastar créditos ni tener
// claves. Esto es deliberado, no un atajo temporal.

import { porId } from './tipos.js'
import { ICON_NAMES, iconSvg } from './icons.js'
import { generarArtefactoDividido, planificar } from './pipeline.js'

const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini'
// Endpoint compatible con OpenAI. Se puede apuntar a cualquier proveedor
// que hable el mismo protocolo (OpenAI, Groq, OpenRouter, un proxy propio...).
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'

// El artefacto es código libre, pero tiene que parecer parte de AuraNote.
// Estos tokens son los mismos de src/styles/main.css: si cambian allí,
// cámbialos aquí. Ver docs/diseno.md
const SISTEMA_DE_DISENO = String.raw`
## Craft

You are making a real, self-contained artifact — the kind a person would be proud
to share. Not a wireframe, not a demo. Every element earns its place; if a section
feels empty, solve it with layout, not filler. Less is more: no data slop, no
decorative stats, no lorem ipsum. CSS, HTML, JS and SVG are capable of a great deal —
surprise the reader. Start from a clear idea and push the execution further than the
brief strictly requires.

## Two visual registers — do not confuse them

CHROME (the controls, panels, labels, buttons around your content) is part of a calm,
Notion-like document. Keep it restrained:

  --ink:#37352f; --ink-muted:#6b6a66; --ink-faint:#9b9a97;
  --accent:#2383e2; --accent-hover:#1a6dc0; --accent-soft:#eff6fd;
  --rule:#e9e9e7; --surface:#fbfbfa; --surface-hover:#f4f4f2;
  --radius:10px; --radius-sm:6px;

  · Body background #ffffff, margin 0, padding 16px.
  · Font: ui-sans-serif, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif.
    Body 14-15px, line-height 1.6. Headings weight 600, never 700+.
  · Panels/cards: background var(--surface), 1px solid var(--rule), radius var(--radius),
    shadow none or at most 0 1px 2px rgba(15,15,15,.04).
  · Buttons: accent fill, white text, radius var(--radius-sm), 8px 14px, weight 500,
    150ms hover to var(--accent-hover). Secondary: surface fill + border.
  · Accent blue only on interactive things or one highlighted value. No big blue
    headings, no coloured title bars, no window chrome.

CONTENT is where you can use colour, gradients, texture and depth. But match the FORM
to the subject — do not default to one giant hand-drawn SVG for everything:

  · The subject is itself a picture (a natural cycle, anatomy, a machine, a physical
    scene) -> draw it as a rich illustrated SVG scene, full colour, custom shapes.
  · The subject is structured information (an itinerary, a plan, a comparison, a
    dashboard, steps) -> DO NOT draw a big scene. Lay it out cleanly — cards, columns,
    a timeline — and give it visual texture with SMALL, CONSISTENT ICONS and tasteful
    imagery, not one enormous drawing. This is the more common case; a wall of SVG for
    a to-do list is wrong.
  · Data -> a real chart (bars, line, donut) drawn in SVG, with axes and values.

Icons — use them generously, they carry a lot of the polish. DO NOT hand-draw icons.
Instead drop a placeholder and the host injects a matching Lucide icon:

    <span data-icon="map-pin"></span>
    <span data-icon="coffee" data-icon-size="16"></span>

  · The icon inherits the current text color and defaults to 20px (set data-icon-size
    to override). Style the surrounding element for colour/tint, not the icon itself.
  · Choose the name that MEANS the thing: a fork for a meal, a pin for a place, a clock
    for a time. Never reuse one name for different things.
  · Use ONLY names from this set (anything else renders empty):
    __ICON_NAMES__
  · If you genuinely need a symbol not in the set, THEN draw it as inline SVG.

Imagery without the network (you cannot load remote images):
  · Use small inline SVG illustrations or pictograms as thumbnails / accents.
  · Use CSS gradients and soft shapes as image-like backgrounds for headers or cards.
  · A tinted circle or rounded square holding an icon reads as an avatar/thumbnail.
  · Never leave a broken <img>; never link an external image URL.

Make the content specific and textured; keep the chrome quiet. That contrast is what
makes it look designed.

## Always

  · Responsive: usable width ranges ~950px down to ~360px. Use flex-wrap, grid with
    minmax, relative units. Never fixed pixel widths on layout, never horizontal scroll.
  · FILL THE WIDTH. The body is width:100%; use the whole available width. Do NOT put
    the content in a narrow column pinned to the left leaving an empty gutter. If it is
    long-form text, either center a comfortable measure OR split into columns — never a
    lopsided narrow block. Visual/data layouts (diagrams, dashboards, tables) should
    span the full width.
  · No decorative emoji — but inline SVG icons are encouraged (see above).
  · Smooth 150ms transitions on interaction; nothing flashy or bouncy.
  · Real, concrete content drawn from the fragment — never placeholders like
    "Item 1", "Example", "<your text>".
`

const SYSTEM_PROMPT = String.raw`You generate a single self-contained, interactive HTML
artifact for AuraNote, a document that turns what you write into interface.

You receive a fragment of a note (the main intent) and, as background, the rest of the
note. Build ONE interactive artifact that captures the idea of the fragment — the best
possible version of it, well-crafted and finished.

HARD RULES, NO EXCEPTIONS:
1. Respond with ONLY a complete self-contained HTML document, from "<!doctype html>"
   to "</html>". No prose, no markdown fences, no commentary.
2. All CSS inline in one <style> in the <head>. All JS inline in one <script> before
   </body>. No external stylesheets or scripts.
3. NO external dependencies: no CDNs, no web fonts, no remote images, no module imports.
   It must work fully offline.
4. NO network calls: no fetch, XHR, WebSocket, beacons. 100% self-sufficient.
5. Build the interface that best represents the idea — a diagram, a simulation, a
   comparison, a visualiser, a manipulable model — never a wall of text.
6. Write ALL visible text in the same language as the fragment. These instructions are
   in English; the output is not necessarily.
7. REQUIRED — height reporting. The artifact runs in an isolated iframe that cannot
   measure your height. Without this it renders clipped with a scrollbar. Put this at
   the end of your <script>:

   function reportHeight(){var h=document.documentElement.scrollHeight;window.parent.postMessage({type:'artifact:resize',height:h},'*');}
   window.addEventListener('load',reportHeight);
   new ResizeObserver(reportHeight).observe(document.body);

   Call reportHeight() again after anything that changes the size.
8. Do not set a fixed height on <body> or <html>; let it grow with the content.
${SISTEMA_DE_DISENO.replace('__ICON_NAMES__', ICON_NAMES.join(', '))}`

function buildUserPrompt(fragment, fullNote) {
  return `FRAGMENTO SELECCIONADO (es la intención principal, genera la app sobre esto):
"""
${fragment}
"""

RESTO DE LA NOTA (contexto de fondo, úsalo solo para entender el marco, no es lo que hay que generar):
"""
${fullNote || '(sin contexto adicional)'}
"""

Genera ahora el HTML autocontenido para el fragmento seleccionado.`
}

/**
 * Extrae el HTML de la respuesta del modelo, incluso si viene envuelto en
 * un bloque de código markdown (```html ... ```) o con texto alrededor.
 */
// Sustituye los marcadores de icono del modelo por SVG de Lucide incrustados.
// El artefacto va en un iframe sin red, así que los iconos no pueden venir de
// una CDN: se inyectan aquí, antes de renderizar. Ver docs/diseno.md
export function inlineIcons(html) {
  return html.replace(
    /<(?:span|i)[^>]*data-icon=["']([a-z0-9-]+)["'][^>]*><\/(?:span|i)>/gi,
    (etiqueta, nombre) => {
      const mSize = etiqueta.match(/data-icon-size=["'](\d+)["']/)
      const size = mSize ? Number(mSize[1]) : 20
      const svg = iconSvg(nombre, size)
      // Si el nombre no existe, dejamos un hueco vacío en vez de romper.
      return svg || ''
    },
  )
}

export function extractHtml(raw) {
  if (!raw || typeof raw !== 'string') return null
  let text = raw.trim()

  // Bloque de código markdown ```html ... ``` o ``` ... ```
  const fenced = text.match(/```(?:html)?\s*([\s\S]*?)```/i)
  if (fenced && fenced[1]) {
    text = fenced[1].trim()
  }

  // Si no empieza por <!doctype o <html, busca la primera aparición.
  const lower = text.toLowerCase()
  if (!lower.startsWith('<!doctype') && !lower.startsWith('<html')) {
    const idx = Math.min(
      ...['<!doctype', '<html'].map((needle) => {
        const i = lower.indexOf(needle)
        return i === -1 ? Infinity : i
      }),
    )
    if (idx !== Infinity) {
      text = text.slice(idx)
    }
  }

  const finalLower = text.toLowerCase()
  if (!finalLower.includes('<html')) return null

  return text.trim()
}

function simulatedHtml(fragment) {
  const safeFragment = String(fragment || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))
  const shortFragment = safeFragment.length > 160 ? safeFragment.slice(0, 160) + '…' : safeFragment
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, sans-serif;
    background: #fafaf9;
    color: #37352f;
    padding: 24px;
  }
  .card {
    max-width: 560px;
    margin: 0 auto;
  }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p.muted { color: #9b9a97; font-size: 13px; margin: 0 0 20px; }
  .fragment {
    background: #fff;
    border: 1px solid #ebebea;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
  .stats { display: flex; gap: 12px; margin-bottom: 20px; }
  .stat {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    border: 1px solid #ebebea;
  }
  .stat b { display: block; font-size: 20px; color: #2383e2; }
  .stat span { font-size: 11px; color: #9b9a97; }
  button {
    background: #2383e2;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    cursor: pointer;
  }
  button:hover { opacity: 0.9; }
  #counter { font-size: 13px; margin-top: 10px; color: #787774; }
</style>
</head>
<body>
  <div class="card">
    <h1>Artefacto simulado</h1>
    <p class="muted">Modo de prueba — sin clave de API configurada.</p>
    <div class="fragment">${shortFragment || '(fragmento vacío)'}</div>
    <div class="stats">
      <div class="stat"><b>3</b><span>ideas</span></div>
      <div class="stat"><b>10-30s</b><span>tiempo real</span></div>
      <div class="stat"><b>0</b><span>peticiones de red</span></div>
    </div>
    <button id="btn">Interactuar</button>
    <div id="counter">Clicks: 0</div>
  </div>
  <script>
    let n = 0;
    const counter = document.getElementById('counter');
    document.getElementById('btn').addEventListener('click', () => {
      n += 1;
      counter.textContent = 'Clicks: ' + n;
      reportHeight();
    });
    function reportHeight() {
      const h = document.body.scrollHeight;
      window.parent.postMessage({ type: 'artifact:resize', height: h }, '*');
    }
    reportHeight();
    window.addEventListener('resize', reportHeight);
  </script>
</body>
</html>`
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Genera un artefacto HTML a partir de un fragmento seleccionado y el resto
 * de la nota como contexto. Lanza errores con mensajes útiles en vez de
 * fallar en silencio.
 *
 * @param {string} fragment - el texto seleccionado (intención principal)
 * @param {string} fullNote - el resto de la nota, como contexto de fondo
 * @returns {Promise<string>} el HTML autocontenido generado
 */
// Orquestador: decide cómo generar según el tipo.
//   · diagrama            -> pipeline dividido, ilustración a fondo
//   · auto + tema visual  -> pipeline dividido (el director lo detecta)
//   · auto + no visual    -> llamada única (mantiene el oficio del prompt base)
//   · simulacion/modelo   -> llamada única con su directiva (interactivo)
// El pipeline dividido saca ilustraciones más limpias (A/B). Ver docs/agentes.md
export async function generateArtifactSmart(fragment, fullNote = '', tipo = 'auto') {
  if (!fragment || !fragment.trim()) {
    throw new Error('No hay ningún fragmento seleccionado para generar el artefacto.')
  }
  // Sin clave: modo simulado, como la llamada única.
  if (!API_KEY) return generateArtifact(fragment, fullNote, tipo)

  try {
    if (tipo === 'diagrama') {
      return await generarArtefactoDividido(fragment, { preferencia: 'ilustracion' })
    }
    if (tipo === 'auto') {
      const plan = await planificar(fragment)
      if (plan.necesita_ilustracion && plan.ilustracion) {
        return await generarArtefactoDividido(fragment, { plan })
      }
      // No es visual: la llamada única con el prompt base da mejor resultado.
      return await generateArtifact(fragment, fullNote, 'auto')
    }
  } catch (e) {
    // Si el pipeline falla, caemos a la llamada única en vez de romper.
    console.warn('[AuraNote] pipeline dividido falló, usando llamada única:', e.message)
  }
  return generateArtifact(fragment, fullNote, tipo)
}

export async function generateArtifact(fragment, fullNote = '', tipo = 'auto') {
  // El tipo solo anade una directiva al system prompt; el resto del flujo
  // (simulado, extraccion del HTML, errores) es identico. Ver tipos.js
  const { directiva: d } = porId(tipo)
  const directiva = d ? `

## ${d}` : ''

  if (!fragment || !fragment.trim()) {
    throw new Error('No hay ningún fragmento seleccionado para generar el artefacto.')
  }

  // MODO SIMULADO: sin clave configurada, no hay llamada real.
  if (!API_KEY) {
    await wait(1800 + Math.random() * 1200)
    return simulatedHtml(fragment)
  }

  let response
  try {
    response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT + directiva },
          { role: 'user', content: buildUserPrompt(fragment, fullNote) },
        ],
        // gpt-5 y la serie o solo admiten la temperatura por defecto; para
        // esos modelos no la enviamos.
        ...(/^(gpt-5|o\d)/.test(MODEL) ? {} : { temperature: 0.7 }),
      }),
    })
  } catch (err) {
    throw new Error(
      `No se pudo contactar con el modelo (${BASE_URL}). Comprueba tu conexión de red. Detalle: ${err.message}`,
    )
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error?.message || JSON.stringify(body)
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(`El modelo respondió con error ${response.status}. ${detail || 'Sin más detalles.'}`)
  }

  let data
  try {
    data = await response.json()
  } catch (err) {
    throw new Error('La respuesta del modelo no es JSON válido.')
  }

  const raw = data?.choices?.[0]?.message?.content
  if (!raw || !raw.trim()) {
    throw new Error('El modelo devolvió una respuesta vacía.')
  }

  const html = extractHtml(raw)
  if (!html) {
    throw new Error(
      'El modelo no devolvió un HTML válido. Revisa el prompt o prueba a regenerar.',
    )
  }

  return inlineIcons(html)
}

export const artifactClientConfig = {
  get hasApiKey() {
    return Boolean(API_KEY)
  },
  model: MODEL,
  baseUrl: BASE_URL,
}
