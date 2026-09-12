// Parser de openui-lang -> AST
//
// Formato (spec v0.5 de openui-lang, ver docs/componentes.md):
//   id = Componente(prop: valor, prop2: valor2)
// Los valores pueden ser strings, números, booleanos, arrays, objetos anidados
// y referencias a otros identificadores ya definidos más arriba.
// `root` es el identificador que marca la raíz del árbol.
//
// Averiguación: existe el paquete oficial `@openuidev/lang-core` en npm
// (framework-agnostic: parser, prompt-generation, validation, zod). NO existe
// (a fecha de hoy) un paquete `@openuidev/vue` con renderer oficial de Vue.
// Como las reglas de esta tarea prohíben instalar paquetes nuevos, este
// parser es una implementación propia, deliberadamente tolerante a errores:
// si una línea falla, se reporta el error y se sigue con las demás.

/**
 * Representa un error de parseo con contexto suficiente para depurar.
 */
class OpenUIError {
  constructor(message, { line = null, raw = '' } = {}) {
    this.message = message
    this.line = line
    this.raw = raw
  }
}

/**
 * Tokeniza y parsea el "lado derecho" de una asignación: Componente(props)
 * Devuelve { componentName, props } o lanza un Error con mensaje descriptivo.
 */
function parseCallExpression(text) {
  const callMatch = text.match(/^([A-Za-z_][\w]*)\s*\((.*)\)\s*$/s)
  if (!callMatch) {
    throw new Error(`sintaxis inválida, se esperaba "Componente(props)": "${text}"`)
  }
  const [, componentName, argsTextRaw] = callMatch
  const argsText = argsTextRaw.trim()
  const props = parseArgs(argsText)
  return { componentName, props }
}

/**
 * Parsea los argumentos de una llamada a componente. Soporta dos estilos,
 * mezclables con las restricciones de la spec:
 *   - con nombre:  Map(place: "Lisboa", zoom: 12)
 *   - posicional:  Stack([map, timeline, sugs])   (visto en la doc oficial)
 * Los argumentos posicionales se agrupan bajo la prop "children".
 */
function parseArgs(argsText) {
  const keyed = {}
  const positional = []
  if (argsText.length === 0) return keyed

  const segments = splitTopLevelArgs(argsText)
  for (const segment of segments) {
    const trimmed = segment.trim()
    if (!trimmed) continue
    const keyMatch = trimmed.match(/^([A-Za-z_][\w]*)\s*:\s*([\s\S]*)$/)
    if (keyMatch) {
      const [, key, valueText] = keyMatch
      const parser = createValueParser(valueText)
      keyed[key] = parser.parseValue()
    } else {
      const parser = createValueParser(trimmed)
      positional.push(parser.parseValue())
    }
  }

  if (positional.length === 1) {
    keyed.children = positional[0]
  } else if (positional.length > 1) {
    keyed.children = positional
  }
  return keyed
}

/**
 * Divide una lista de argumentos en segmentos separados por comas de nivel
 * superior, respetando strings y anidamiento de (), [] y {}.
 */
function splitTopLevelArgs(text) {
  const segments = []
  let depth = 0
  let inString = null
  let current = ''
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      current += c
      if (c === '\\' && i + 1 < text.length) {
        current += text[i + 1]
        i++
        continue
      }
      if (c === inString) inString = null
      continue
    }
    if (c === '"' || c === "'") {
      inString = c
      current += c
      continue
    }
    if (c === '(' || c === '[' || c === '{') depth++
    if (c === ')' || c === ']' || c === '}') depth--
    if (c === ',' && depth === 0) {
      segments.push(current)
      current = ''
      continue
    }
    current += c
  }
  if (current.trim()) segments.push(current)
  return segments
}

/**
 * Parser de un valor genérico en openui-lang: string, número, booleano,
 * array, objeto, o identificador (referencia). Usa un cursor sobre la
 * cadena para poder anidar sin regex frágiles.
 */
function createValueParser(text) {
  let i = 0
  const len = text.length

  function skipWs() {
    while (i < len && /\s/.test(text[i])) i++
  }

  function peek() {
    return text[i]
  }

  function parseValue() {
    skipWs()
    if (i >= len) throw new Error('valor esperado, se encontró el final de la entrada')
    const c = peek()
    if (c === '"' || c === "'") return parseString(c)
    if (c === '[') return parseArray()
    if (c === '{') return parseObject()
    if (/[-\d]/.test(c)) return parseNumber()
    return parseKeywordOrRef()
  }

  function parseString(quote) {
    i++ // salta comilla inicial
    let out = ''
    while (i < len && text[i] !== quote) {
      if (text[i] === '\\' && i + 1 < len) {
        out += text[i + 1]
        i += 2
      } else {
        out += text[i]
        i++
      }
    }
    if (i >= len) throw new Error('string sin cerrar')
    i++ // salta comilla final
    return out
  }

  function parseNumber() {
    const start = i
    if (peek() === '-') i++
    while (i < len && /[\d.]/.test(text[i])) i++
    const raw = text.slice(start, i)
    const num = Number(raw)
    if (Number.isNaN(num)) throw new Error(`número inválido: "${raw}"`)
    return num
  }

  function parseArray() {
    i++ // [
    const items = []
    skipWs()
    if (peek() === ']') {
      i++
      return items
    }
    while (true) {
      items.push(parseValue())
      skipWs()
      if (peek() === ',') {
        i++
        continue
      }
      if (peek() === ']') {
        i++
        break
      }
      throw new Error(`se esperaba "," o "]" en el array, se encontró "${peek() ?? 'EOF'}"`)
    }
    return items
  }

  function parseObject() {
    i++ // {
    const obj = {}
    skipWs()
    if (peek() === '}') {
      i++
      return obj
    }
    while (true) {
      skipWs()
      const key = parseIdentifier()
      skipWs()
      if (peek() !== ':') throw new Error(`se esperaba ":" tras la clave "${key}"`)
      i++ // :
      const value = parseValue()
      obj[key] = value
      skipWs()
      if (peek() === ',') {
        i++
        continue
      }
      if (peek() === '}') {
        i++
        break
      }
      throw new Error(`se esperaba "," o "}" en el objeto, se encontró "${peek() ?? 'EOF'}"`)
    }
    return obj
  }

  function parseIdentifier() {
    const start = i
    while (i < len && /[\w]/.test(text[i])) i++
    if (i === start) throw new Error(`identificador esperado en la posición ${i}`)
    return text.slice(start, i)
  }

  function parseKeywordOrRef() {
    const id = parseIdentifier()
    if (id === 'true') return true
    if (id === 'false') return false
    if (id === 'null') return null
    // Es una referencia a otro identificador: se resuelve en una segunda pasada.
    return { __ref: id }
  }

  return { parseValue, parseObject, skipWs, get pos() { return i }, get done() { return i >= len } }
}

/**
 * Parsea el texto completo de openui-lang.
 * @param {string} source
 * @returns {{ nodes: Record<string, {name:string, component:string, props:object}>, errors: OpenUIError[], rootId: string|null }}
 */
export function parseOpenUI(source) {
  const nodes = {}
  const errors = []
  const order = []

  const lines = String(source ?? '').split('\n')
  let buffer = ''
  let bufferStartLine = null

  const flush = (lineNumberForError) => {
    const raw = buffer.trim()
    buffer = ''
    if (!raw) return
    try {
      processLine(raw, bufferStartLine ?? lineNumberForError)
    } catch (err) {
      errors.push(new OpenUIError(err.message, { line: bufferStartLine ?? lineNumberForError, raw }))
    }
    bufferStartLine = null
  }

  function processLine(raw, lineNumber) {
    const eqIndex = findTopLevelEquals(raw)
    if (eqIndex === -1) {
      throw new Error(`falta "=" en la línea: "${raw}"`)
    }
    const id = raw.slice(0, eqIndex).trim()
    const rhs = raw.slice(eqIndex + 1).trim()
    if (!/^[A-Za-z_][\w]*$/.test(id)) {
      throw new Error(`identificador inválido: "${id}"`)
    }
    if (nodes[id]) {
      throw new Error(`identificador duplicado: "${id}"`)
    }
    const { componentName, props } = parseCallExpression(rhs)
    nodes[id] = { name: id, component: componentName, props, line: lineNumber }
    order.push(id)
  }

  // Balanceo de paréntesis/corchetes/llaves para soportar líneas multi-línea
  // (arrays/objetos con saltos de línea dentro de una misma declaración).
  let depth = 0
  lines.forEach((line, idx) => {
    const lineNumber = idx + 1
    if (buffer === '' && line.trim() === '') return
    if (buffer === '') bufferStartLine = lineNumber
    buffer += (buffer ? '\n' : '') + line
    depth += countDelta(line)
    if (depth <= 0) {
      flush(lineNumber)
      depth = 0
    }
  })
  if (buffer.trim()) {
    flush(lines.length)
  }

  // Resolver referencias entre identificadores
  for (const id of order) {
    try {
      nodes[id].props = resolveRefs(nodes[id].props, nodes, id, new Set([id]))
    } catch (err) {
      errors.push(new OpenUIError(err.message, { line: nodes[id].line, raw: id }))
      delete nodes[id]
    }
  }

  // Detectar huérfanos: ids definidos pero nunca alcanzados desde root
  const rootId = nodes.root ? 'root' : null
  if (!rootId && order.length > 0) {
    errors.push(new OpenUIError('no se ha definido ningún nodo "root"', { line: null, raw: '' }))
  }

  if (rootId) {
    const reachable = new Set()
    collectReachable(nodes, rootId, reachable)
    for (const id of order) {
      if (nodes[id] && !reachable.has(id)) {
        errors.push(new OpenUIError(`id huérfano, no referenciado desde "root": "${id}"`, { line: nodes[id].line, raw: id }))
      }
    }
  }

  return { nodes, errors, rootId }
}

function countDelta(line) {
  // Ignora paréntesis/corchetes dentro de strings de forma simple.
  let delta = 0
  let inString = null
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inString) {
      if (c === '\\') { i++; continue }
      if (c === inString) inString = null
      continue
    }
    if (c === '"' || c === "'") { inString = c; continue }
    if (c === '(' || c === '[' || c === '{') delta++
    if (c === ')' || c === ']' || c === '}') delta--
  }
  return delta
}

function findTopLevelEquals(raw) {
  let depth = 0
  let inString = null
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i]
    if (inString) {
      if (c === '\\') { i++; continue }
      if (c === inString) inString = null
      continue
    }
    if (c === '"' || c === "'") { inString = c; continue }
    if (c === '(' || c === '[' || c === '{') depth++
    if (c === ')' || c === ']' || c === '}') depth--
    if (c === '=' && depth === 0) return i
  }
  return -1
}

/**
 * Sustituye los marcadores { __ref: id } por el nodo real, resolviendo
 * recursivamente. Detecta ciclos y referencias no definidas.
 */
function resolveRefs(value, nodes, ownerId, visiting) {
  if (Array.isArray(value)) {
    return value.map((v) => resolveRefs(v, nodes, ownerId, visiting))
  }
  if (value && typeof value === 'object') {
    if ('__ref' in value && Object.keys(value).length === 1) {
      const refId = value.__ref
      if (!nodes[refId]) {
        throw new Error(`"${ownerId}" referencia un id no definido: "${refId}"`)
      }
      if (visiting.has(refId)) {
        throw new Error(`referencia circular detectada en "${refId}"`)
      }
      const nextVisiting = new Set(visiting)
      nextVisiting.add(refId)
      const resolvedProps = resolveRefs(nodes[refId].props, nodes, refId, nextVisiting)
      return { __node: refId, component: nodes[refId].component, props: resolvedProps }
    }
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      out[k] = resolveRefs(v, nodes, ownerId, visiting)
    }
    return out
  }
  return value
}

function collectReachable(nodes, id, seen) {
  if (seen.has(id) || !nodes[id]) return
  seen.add(id)
  const walk = (v) => {
    if (Array.isArray(v)) { v.forEach(walk); return }
    if (v && typeof v === 'object') {
      if (v.__node) { collectReachable(nodes, v.__node, seen); return }
      Object.values(v).forEach(walk)
    }
  }
  walk(nodes[id].props)
}

/**
 * Construye el árbol final a partir del resultado de parseOpenUI, listo
 * para que el Renderer lo recorra. Cada nodo del árbol es:
 * { id, component, props } donde props ya no contiene referencias crudas,
 * sino sub-árboles anidados marcados con __node.
 */
export function buildTree(parsed) {
  if (!parsed.rootId) return null
  const node = parsed.nodes[parsed.rootId]
  if (!node) return null
  return { id: parsed.rootId, component: node.component, props: node.props }
}

export { OpenUIError }
