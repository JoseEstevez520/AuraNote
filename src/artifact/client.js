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

const API_KEY = import.meta.env.VITE_LLM_API_KEY || ''
const MODEL = import.meta.env.VITE_LLM_MODEL || 'gpt-4o-mini'
// Endpoint compatible con OpenAI. Se puede apuntar a cualquier proveedor
// que hable el mismo protocolo (OpenAI, Groq, OpenRouter, un proxy propio...).
const BASE_URL = import.meta.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1'

const SYSTEM_PROMPT = `Eres un generador de aplicaciones web interactivas autocontenidas.

Vas a recibir un fragmento de una nota (la intención principal) y, como contexto de
fondo, el resto de la nota donde vive ese fragmento. Tu trabajo es generar UNA aplicación
interactiva que capture la idea del fragmento.

REGLAS ESTRICTAS, SIN EXCEPCIONES:
1. Responde ÚNICAMENTE con un documento HTML completo y autocontenido, empezando por
   "<!doctype html>" y terminando en "</html>".
2. Todo el CSS va inline dentro de una etiqueta <style> en el <head>. Todo el JS va
   inline dentro de una etiqueta <script> antes de </body>. Prohibido enlazar hojas de
   estilo o scripts externos.
3. PROHIBIDO cualquier dependencia externa: nada de CDNs, nada de fuentes de Google,
   nada de imágenes remotas, nada de imports de módulos externos. El documento debe
   funcionar sin conexión a red.
4. PROHIBIDO cualquier llamada de red: sin fetch, sin XMLHttpRequest, sin WebSocket,
   sin beacons, sin trackers. La aplicación debe ser 100% autosuficiente.
5. No incluyas explicaciones, comentarios fuera del HTML, ni bloques de markdown en tu
   respuesta. Solo el HTML puro.
6. Diseña algo visualmente cuidado y coherente con el contenido: si el fragmento habla
   de un viaje, no generes texto plano — construye la interfaz que mejor represente esa
   idea (mapa esquemático, línea temporal, checklist, calculadora, visualizador, etc.)
   usando solo HTML/CSS/JS.
7. Si necesitas comunicar tu altura real al documento que te incrusta, puedes hacer
   opcionalmente: window.parent.postMessage({ type: 'artifact:resize', height: <px> }, '*')
   cada vez que cambie el contenido. No es obligatorio, pero ayuda al ajuste visual.`

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
export async function generateArtifact(fragment, fullNote = '') {
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(fragment, fullNote) },
        ],
        temperature: 0.7,
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

  return html
}

export const artifactClientConfig = {
  get hasApiKey() {
    return Boolean(API_KEY)
  },
  model: MODEL,
  baseUrl: BASE_URL,
}
