// Nodo custom de TipTap para el Nivel 1 — la sección.
//
// Igual que el artefacto, es un nodo de bloque atómico: el contenido vive en
// el atributo `lang` (openui-lang) y se renderiza con los componentes de
// src/ui/. Al ser un nodo del árbol de ProseMirror se serializa con el
// documento, así que la sección sigue ahí tras recargar.
import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import SectionBlock from './SectionBlock.vue'

export const SectionNode = Node.create({
  name: 'sectionBlock',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      // openui-lang devuelto por el modelo. null mientras carga.
      lang: { default: null },
      // El fragmento que originó la sección: ancla el bloque a su origen
      // y permite regenerar.
      source: { default: '' },
      // El resto de la nota, como contexto de fondo para el modelo.
      context: { default: '' },
      // 'loading' | 'ready' | 'error'
      status: { default: 'loading' },
      error: { default: null },
      createdAt: { default: () => new Date().toISOString() },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-section-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-section-block': 'true' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(SectionBlock)
  },
})

export default SectionNode
