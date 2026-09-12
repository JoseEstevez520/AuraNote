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

    <!-- Aviso discreto mientras no haya claves: todo funciona simulado. -->
    <p v-if="seccionSimulada" class="fixed bottom-4 left-6 text-xs text-ink-faint">
      Modo simulado · añade las claves en <code>.env</code> para generar de verdad
    </p>
  </main>
</template>
