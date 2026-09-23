// Extensión de TipTap para las sugerencias ambiente.
//
// Al CERRAR un párrafo (el cursor sale de él), un modelo pequeño decide si
// merece la pena ofrecer generar algo. Si sí, aparece una pista tenue al final
// del párrafo — "＋ ver como mapa" — que al pulsarla genera. Detectar es
// automático; generar sigue siendo un clic. Ver docs/interaccion.md
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import { decidir } from '../generate/router.js'
import { sugerenciasActivas } from './state.js'

const key = new PluginKey('sugerencias')

function hash(t) {
  let h = 0
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0
  return h
}

// Texto del bloque de nivel superior que contiene la posición pos.
function bloqueEn(doc, pos) {
  const $ = doc.resolve(Math.min(pos, doc.content.size))
  const idx = $.index(0)
  if (idx >= doc.childCount) return null
  const nodo = doc.child(idx)
  let inicio = 0
  for (let i = 0; i < idx; i++) inicio += doc.child(i).nodeSize
  return { nodo, inicio, fin: inicio + nodo.nodeSize }
}

export const SuggestionExtension = Extension.create({
  name: 'sugerencias',

  addOptions() {
    return {
      // Se llama al aceptar una sugerencia: { action, tipo, label, text, pos }.
      onAccept: () => {},
    }
  },

  addProseMirrorPlugins() {
    const opciones = this.options
    let debounce = null
    let ultimoBloqueInicio = null

    return [
      new Plugin({
        key,
        state: {
          init: () => ({ sugerencias: new Map(), descartados: new Set() }),
          apply(tr, valor) {
            const meta = tr.getMeta(key)
            if (!meta) return valor
            if (meta.tipo === 'add') {
              const s = new Map(valor.sugerencias)
              s.set(meta.hash, { label: meta.label, action: meta.action, kind: meta.kind })
              return { ...valor, sugerencias: s }
            }
            if (meta.tipo === 'descartar') {
              const d = new Set(valor.descartados)
              d.add(meta.hash)
              const s = new Map(valor.sugerencias)
              s.delete(meta.hash)
              return { sugerencias: s, descartados: d }
            }
            return valor
          },
        },

        view() {
          return {
            update(vista, estadoPrevio) {
              if (!sugerenciasActivas.value) return
              const sel = vista.state.selection
              const bloque = bloqueEn(vista.state.doc, sel.from)
              const inicioActual = bloque ? bloque.inicio : null

              // ¿Ha cambiado el bloque donde está el cursor? -> se cerró el anterior
              if (inicioActual === ultimoBloqueInicio) return
              const cerradoInicio = ultimoBloqueInicio
              ultimoBloqueInicio = inicioActual
              if (cerradoInicio == null) return

              const cerrado = bloqueEn(estadoPrevio.doc, cerradoInicio)
              if (!cerrado || cerrado.nodo.type.name !== 'paragraph') return
              const texto = cerrado.nodo.textContent.trim()
              if (texto.length < 40) return

              clearTimeout(debounce)
              debounce = setTimeout(async () => {
                const estado = key.getState(vista.state)
                const h = hash(texto)
                if (estado.descartados.has(h) || estado.sugerencias.has(h)) return
                const r = await decidir(texto, { exigente: true })
                if (!r.merece) return
                // Comprobar que el párrafo sigue existiendo antes de pintar
                vista.dispatch(
                  vista.state.tr.setMeta(key, {
                    tipo: 'add',
                    hash: h,
                    label: r.label,
                    action: r.mode,
                    kind: r.kind,
                  }),
                )
              }, 400)
            },
          }
        },

        props: {
          decorations(estadoEditor) {
            if (!sugerenciasActivas.value) return DecorationSet.empty
            const { sugerencias, descartados } = key.getState(estadoEditor)
            if (sugerencias.size === 0) return DecorationSet.empty
            const sel = estadoEditor.selection
            const bloqueCursor = bloqueEn(estadoEditor.doc, sel.from)
            const decos = []
            const doc = estadoEditor.doc

            doc.forEach((nodo, offset) => {
              if (nodo.type.name !== 'paragraph') return
              const h = hash(nodo.textContent.trim())
              if (descartados.has(h)) return
              const s = sugerencias.get(h)
              if (!s) return
              // No mostrar en el párrafo activo
              if (bloqueCursor && bloqueCursor.inicio === offset) return
              const fin = offset + nodo.nodeSize - 1
              decos.push(
                Decoration.widget(fin, () => construirChip(s, nodo.textContent.trim(), offset + nodo.nodeSize, opciones), {
                  side: 1,
                  key: 'sug-' + h,
                }),
              )
            })
            return DecorationSet.create(doc, decos)
          },
        },
      }),
    ]
  },
})

// Construye el chip DOM. side:1 lo pone al final del párrafo.
function construirChip(sug, texto, posInsertar, opciones) {
  const cont = document.createElement('span')
  cont.className = 'sug-chip'
  cont.contentEditable = 'false'

  const boton = document.createElement('button')
  boton.type = 'button'
  boton.className = 'sug-chip__accion'
  boton.innerHTML =
    '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg>' +
    '<span>' + escapar(sug.label) + '</span>'
  boton.addEventListener('mousedown', (e) => {
    e.preventDefault()
    opciones.onAccept({ action: sug.action, tipo: sug.kind, label: sug.label, text: texto, pos: posInsertar })
  })

  const cerrar = document.createElement('button')
  cerrar.type = 'button'
  cerrar.className = 'sug-chip__cerrar'
  cerrar.setAttribute('aria-label', 'Descartar')
  cerrar.textContent = '×'
  cerrar.addEventListener('mousedown', (e) => {
    e.preventDefault()
    opciones.onDismiss?.(texto)
  })

  cont.appendChild(boton)
  cont.appendChild(cerrar)
  return cont
}

function escapar(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

export { key as suggestionKey, hash as hashParrafo }
