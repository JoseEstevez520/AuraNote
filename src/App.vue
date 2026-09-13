<script setup>
// AuraNote — la aplicación.
//
// Une las piezas: el documento (src/editor), el Nivel 1 (src/section), el
// Nivel 2 (src/artifact) y las sugerencias ambiente (src/suggest). Ambos
// niveles operan sobre el mismo gesto; las sugerencias lo ofrecen solas al
// cerrar un párrafo. Ver docs/concepto.md y docs/interaccion.md
import { ref } from 'vue'
import { NoteEditor } from './editor/index.js'
import { SectionNode } from './section/index.js'
import { ArtifactNode } from './artifact/index.js'
import { modoSimulado as seccionSimulada } from './section/client.js'
import { textos, idioma, setIdioma, IDIOMAS } from './i18n/index.js'
import { SuggestionExtension, suggestionKey, hashParrafo } from './suggest/suggestionExtension.js'
import { sugerenciasActivas } from './suggest/state.js'
import { clasificar } from './generate/router.js'

const editorRef = ref(null)

// Sugerencias: al aceptar, insertamos el bloque tras el párrafo; al descartar
// (o tras aceptar) marcamos ese párrafo para no volver a ofrecerlo.
function descartarPorTexto(texto) {
  const editor = editorRef.value?.editor
  if (!editor) return
  editor.view.dispatch(
    editor.state.tr.setMeta(suggestionKey, { tipo: 'descartar', hash: hashParrafo(texto.trim()) }),
  )
}

function aceptarSugerencia({ action, text, pos, tipo = 'auto' }) {
  insertarEn(action === 'artifact' ? 'artifactBlock' : 'sectionBlock', pos, text, tipo)
  descartarPorTexto(text) // que no siga ofreciéndose una vez aceptada
}

const extensions = [
  SectionNode,
  ArtifactNode,
  SuggestionExtension.configure({
    onAccept: aceptarSugerencia,
    onDismiss: descartarPorTexto,
  }),
]

// Inserta un bloque generado en la posición dada (después de un párrafo). El
// bloque nace en 'loading' y se genera solo.
function insertarEn(nodo, pos, text, tipo) {
  const editor = editorRef.value?.editor
  if (!editor || !text?.trim()) return
  const destino = Math.min(pos, editor.state.doc.content.size)
  editor
    .chain()
    .insertContentAt(destino, {
      type: nodo,
      attrs: {
        source: text,
        context: editor.getText(),
        status: 'loading',
        ...(nodo === 'artifactBlock' ? { kind: tipo } : {}),
      },
    })
    .run()
}

// Un solo gesto "Generar": el router decide sección o artefacto, y se inserta
// tras el bloque donde acaba la selección. El usuario no elige entre opciones.
async function onGenerate({ text, to }) {
  const editor = editorRef.value?.editor
  if (!editor || !text?.trim()) return
  const $to = editor.state.doc.resolve(Math.min(to, editor.state.doc.content.size))
  const pos = $to.depth > 0 ? $to.after(1) : editor.state.doc.content.size

  const { mode, kind } = await clasificar(text)
  const nodo = mode === 'artifact' ? 'artifactBlock' : 'sectionBlock'
  insertarEn(nodo, pos, text, kind)
}
</script>

<template>
  <main class="min-h-screen bg-white">
    <NoteEditor ref="editorRef" :extensions="extensions" @generate="onGenerate" />

    <!-- Barra de pie: modo simulado, interruptor de sugerencias e idioma. -->
    <div class="pointer-events-none fixed inset-x-0 bottom-3 flex items-center justify-between px-6 text-xs text-ink-faint">
      <p v-if="seccionSimulada">{{ textos.app.simulated }}</p>
      <span v-else />

      <div class="pointer-events-auto flex items-center gap-3">
        <!-- Interruptor de sugerencias ambiente -->
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-[var(--radius-sm)] px-1.5 py-0.5 transition-colors hover:text-ink"
          :class="sugerenciasActivas ? 'text-accent' : ''"
          :title="textos.app.suggestionsHint"
          @click="sugerenciasActivas = !sugerenciasActivas"
        >
          <span
            class="inline-block size-1.5 rounded-full"
            :class="sugerenciasActivas ? 'bg-accent' : 'bg-ink-faint'"
          />
          {{ textos.app.suggestions }}
        </button>

        <span class="h-3 w-px bg-rule" />

        <div class="flex items-center gap-1">
          <button
            v-for="l in IDIOMAS"
            :key="l.id"
            type="button"
            class="rounded-[var(--radius-sm)] px-1.5 py-0.5 transition-colors hover:text-ink"
            :class="idioma === l.id ? 'text-ink' : ''"
            @click="setIdioma(l.id)"
          >
            {{ l.id.toUpperCase() }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
