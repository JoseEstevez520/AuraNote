// Componentes stub para el banco de pruebas del renderer.
//
// La librería real vive en src/ui/registry.js y la está construyendo otro
// agente en paralelo. Este archivo NO depende de ella: existe justo para que
// /openui-demo.html funcione y se pueda verificar de forma aislada aunque
// src/ui/registry.js todavía no exista o esté a medias.
//
// Cada stub es una caja simple que muestra el nombre del componente y sus
// props tal cual, para poder comprobar visualmente que el árbol se construyó
// bien sin necesidad de tener el diseño final.
import { h } from 'vue'

function makeStub(name) {
  return {
    name: `Stub${name}`,
    props: { },
    setup(_, { attrs, slots }) {
      return () =>
        h('div', { class: 'oui-stub', 'data-component': name }, [
          h('div', { class: 'oui-stub__head' }, name),
          h('pre', { class: 'oui-stub__props' }, JSON.stringify(attrs, null, 2)),
          slots.default ? h('div', { class: 'oui-stub__children' }, slots.default()) : null,
        ])
    },
  }
}

// Lista de componentes de la librería según docs/componentes.md.
const NAMES = ['Stack', 'Row', 'Grid', 'Section', 'Map', 'Timeline', 'Table', 'Card', 'List', 'Stat', 'Text']

export const stubRegistry = Object.fromEntries(NAMES.map((n) => [n, makeStub(n)]))
