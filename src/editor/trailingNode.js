// Mantiene siempre un párrafo vacío al final del documento.
//
// Sin esto, cuando el último nodo es un bloque atómico —una sección o un
// artefacto— no hay dónde poner el cursor para seguir escribiendo: hay que
// subir al párrafo de arriba y dar al Enter. Es el comportamiento que tiene
// Notion y que se echa en falta en cuanto generas algo.
import { Extension } from '@tiptap/core'
import { PluginKey, Plugin } from '@tiptap/pm/state'

export const TrailingNode = Extension.create({
  name: 'trailingNode',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('trailingNode'),
        appendTransaction(_transacciones, _anterior, estado) {
          const { doc, tr, schema } = estado
          const ultimo = doc.lastChild

          // Ya termina en un párrafo: nada que hacer.
          if (ultimo && ultimo.type.name === 'paragraph') return null

          return tr.insert(doc.content.size, schema.nodes.paragraph.create())
        },
      }),
    ]
  },
})

export default TrailingNode
