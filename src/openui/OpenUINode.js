// Componente auxiliar recursivo del Renderer: recorre el árbol resuelto por
// el parser y monta cada nodo con <component :is>. Vive en su propio módulo
// (en vez de dentro de Renderer.vue) porque necesita referenciarse a sí
// mismo para renderizar hijos anidados, y eso requiere `name` + import,
// no funciona bien mezclado con <script setup>.
import { h } from 'vue'

const OpenUINode = {
  name: 'OpenUINode',
  props: {
    node: { type: Object, required: true },
    registry: { type: Object, required: true },
  },
  render() {
    const { node, registry } = this
    if (!node || typeof node !== 'object') return null
    const Comp = registry[node.component]

    if (!Comp) {
      return h('div', { class: 'openui-missing' }, [
        h('div', { class: 'openui-missing__label' }, `Componente no registrado: "${node.component}"`),
        h('pre', { class: 'openui-missing__props' }, JSON.stringify(deepUnwrap(node.props), null, 2)),
      ])
    }

    const resolvedProps = {}
    const slotChildren = []

    for (const [key, value] of Object.entries(node.props ?? {})) {
      if (key === 'children') {
        collectChildren(value).forEach((childNode) => {
          slotChildren.push(h(OpenUINode, { node: childNode, registry }))
        })
        continue
      }
      resolvedProps[key] = deepUnwrap(value)
    }

    return h(Comp, resolvedProps, slotChildren.length ? { default: () => slotChildren } : undefined)
  },
}

function collectChildren(value) {
  if (Array.isArray(value)) return value.filter((v) => v && v.__node)
  if (value && value.__node) return [value]
  return []
}

// Sustituye nodos { __node, component, props } anidados dentro de props
// "normales" (no children) por una representación plana informativa, por si
// un componente recibe una referencia en una prop no destinada a hijos.
function deepUnwrap(value) {
  if (Array.isArray(value)) return value.map((v) => deepUnwrap(v))
  if (value && typeof value === 'object') {
    if (value.__node) return { referencia: value.__node, componente: value.component }
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = deepUnwrap(v)
    return out
  }
  return value
}

export default OpenUINode
