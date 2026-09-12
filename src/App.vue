<script setup>
// AuraNote — la aplicación.
//
// Une las tres piezas: el documento (src/editor), el Nivel 1 (src/section) y
// el Nivel 2 (src/artifact). Ambos niveles operan sobre el mismo gesto —un
// fragmento seleccionado— y se diferencian en ambición. Ver docs/concepto.md
import { ref } from 'vue'
import { NoteEditor } from './editor/index.js'
import { SectionNode } from './section/index.js'
import { ArtifactNode } from './artifact/index.js'
import { modoSimulado as seccionSimulada } from './section/client.js'
import { textos, idioma, setIdioma, IDIOMAS } from './i18n/index.js'

const editorRef = ref(null)
const extensions = [SectionNode, ArtifactNode]

// Inserta el bloque justo debajo del párrafo donde acaba la selección, nunca
// encima ni dentro. El bloque nace en estado 'loading' y se genera solo.
function insertarBajoLaSeleccion(nodo, { text, to, tipo = 'auto' }) {
  const editor = editorRef.value?.editor
  if (!editor || !text?.trim()) return

  const { state } = editor
  const $to = state.doc.resolve(Math.min(to, state.doc.content.size))
  // Posición justo después del bloque de nivel superior que contiene el final
  // de la selección.
  const pos = $to.depth > 0 ? $to.after(1) : state.doc.content.size

  editor
    .chain()
    .insertContentAt(pos, {
      type: nodo,
      attrs: {
        source: text,
        context: editor.getText(),
        status: 'loading',
        // Solo lo usa el artefacto; la sección lo ignora.
        ...(nodo === 'artifactBlock' ? { kind: tipo } : {}),
      },
    })
    .run()
}

const onSection = (p) => insertarBajoLaSeleccion('sectionBlock', p)
const onArtifact = (p) => insertarBajoLaSeleccion('artifactBlock', p)
</script>

<template>
  <main class="min-h-screen bg-white">
    <NoteEditor
      ref="editorRef"
      :extensions="extensions"
      @generate-section="onSection"
      @generate-artifact="onArtifact"
    />

    <!-- Barra de pie: aviso de modo simulado e idioma. Discreta, fuera del
         camino de lectura. -->
    <div class="pointer-events-none fixed inset-x-0 bottom-3 flex items-center justify-between px-6 text-xs text-ink-faint">
      <p v-if="seccionSimulada">{{ textos.app.simulated }}</p>
      <span v-else />

      <div class="pointer-events-auto flex items-center gap-1">
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
  </main>
</template>
