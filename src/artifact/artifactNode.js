// Nodo custom de TipTap para el Nivel 2 — el artefacto.
//
// Es un nodo de bloque, atómico (no editable por dentro): el contenido real
// vive en el atributo `html` y se renderiza en un iframe aislado, no como
// texto editable del documento. Al ser un nodo del árbol de ProseMirror, se
// serializa gratis con el resto del documento — por eso el artefacto sigue
// ahí tras recargar la página, sin código adicional de persistencia.

import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ArtifactBlock from './ArtifactBlock.vue'

export const ArtifactNode = Node.create({
  name: 'artifactBlock',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      // El HTML autocontenido generado por el modelo. Puede ser null
      // mientras el bloque está en estado "loading".
      html: {
        default: null,
      },
      // El fragmento de texto que originó este artefacto. Sirve para
      // regenerar y para que el bloque quede anclado a su origen.
      source: {
        default: '',
      },
      // Tipo elegido en el desplegable: auto | diagrama | simulacion | modelo.
      // Se guarda para que "Regenerar" respete lo que se pidió. Ver tipos.js
      kind: {
        default: 'auto',
      },
      // 'loading' | 'ready' | 'error'
      status: {
        default: 'loading',
      },
      // Mensaje de error legible, cuando status === 'error'.
      error: {
        default: null,
      },
      // Marca de tiempo ISO de creación, para trazabilidad.
      createdAt: {
        default: () => new Date().toISOString(),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-artifact-block]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    // Representación mínima para exportar a HTML plano (no se usa como
    // fuente de verdad; el JSON del documento es lo que persiste).
    return ['div', mergeAttributes(HTMLAttributes, { 'data-artifact-block': 'true' })]
  },

  addNodeView() {
    return VueNodeViewRenderer(ArtifactBlock)
  },
})

export default ArtifactNode
