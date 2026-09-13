<script setup>
// Editor principal de la nota. Estética Notion: columna de 720px,
// sin bordes, sin sombras, sin cards. El aire vertical es el diseño.
import { onBeforeUnmount, watch } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TrailingNode from './trailingNode.js'
import { textos, idioma } from '../i18n/index.js'
import SelectionMenu from './SelectionMenu.vue'
import { useAutosave } from './useAutosave.js'

const props = defineProps({
  // Nodos adicionales (sectionBlock, artifactBlock). Se inyectan desde fuera
  // para que el editor no dependa de los niveles de generación.
  extensions: { type: Array, default: () => [] },
})

const emit = defineEmits(['generate'])

const { status, loadDocument, scheduleSave } = useAutosave()

const savedDoc = loadDocument()

const editor = new Editor({
  extensions: [
    StarterKit,
    // El placeholder oficial se pinta dentro del propio párrafo con ::before,
    // así que queda siempre alineado. Antes era un <p> absoluto con un
    // top fijo que no cuadraba con el padding responsivo.
    Placeholder.configure({ placeholder: () => textos.value.editor.placeholder }),
    TrailingNode,
    ...props.extensions,
  ],
  content: savedDoc ?? '',
  editorProps: {
    attributes: {
      class: 'note-prose focus:outline-none',
      spellcheck: 'true',
    },
  },
  onUpdate: ({ editor }) => {
    scheduleSave(editor.getJSON())
  },
})

// Clic en la zona muerta bajo el documento: lleva el cursor al final.
//
// Va en mousedown con preventDefault, no en click: al pulsar sobre un div no
// editable el navegador quita el foco del editor, y lo hace DESPUÉS de que
// corriera nuestro manejador. Con @click el comando devolvía true pero el
// foco acababa en el body.
function enfocarFinal() {
  // El comando coloca la selección al final, pero no siempre lleva el foco
  // del DOM al editor (devuelve true y activeElement se queda en body), así
  // que se fuerza sobre el nodo de ProseMirror.
  editor.commands.focus('end')
  editor.view.dom.focus()
}

onBeforeUnmount(() => {
  editor.destroy()
})

// Se expone para que App.vue pueda insertar bloques generados.
// El placeholder lo resuelve una función, así que al cambiar de idioma hay
// que pedirle a ProseMirror que repinte las decoraciones.
watch(idioma, () => editor.view.dispatch(editor.state.tr))

defineExpose({ editor })

function handleGenerate(payload) {
  emit('generate', payload)
}
</script>

<template>
  <div class="note-column relative flex min-h-screen flex-col py-10 sm:py-16">
    <EditorContent :editor="editor" />

    <!-- Zona muerta bajo el documento: clicar aquí lleva el cursor al final,
         igual que en Notion. Evita tener que subir al párrafo anterior. -->
    <div
      class="w-full flex-1 cursor-text"
      style="min-height: 35vh"
      @mousedown.prevent="enfocarFinal"
      aria-hidden="true"
    />

    <SelectionMenu :editor="editor" @generate="handleGenerate" />

    <!-- Indicador de guardado, discreto, aparece y se desvanece -->
    <p
      class="fixed bottom-4 right-6 text-xs text-ink-faint transition-opacity duration-500"
      :class="status === 'saved' ? 'opacity-100' : 'opacity-0'"
    >
      {{ textos.editor.saved }}
    </p>
  </div>
</template>

<style>
/* Tipografía del documento. Sin bordes, sin sombras, sin cards. */
.note-prose {
  color: var(--color-ink);
  font-size: 16px;
  line-height: 1.6;
}

.note-prose:focus {
  outline: none;
}

.note-prose p {
  margin: 0.4em 0;
}

.note-prose h1 {
  font-size: 1.875em;
  font-weight: 700;
  margin: 1.4em 0 0.3em;
  line-height: 1.3;
}

.note-prose h2 {
  font-size: 1.5em;
  font-weight: 700;
  margin: 1.2em 0 0.3em;
  line-height: 1.3;
}

.note-prose h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0 0.3em;
  line-height: 1.3;
}

.note-prose strong {
  font-weight: 600;
}

.note-prose em {
  font-style: italic;
}

.note-prose ul,
.note-prose ol {
  padding-left: 1.5em;
  margin: 0.4em 0;
}

.note-prose li {
  margin: 0.15em 0;
}

.note-prose code {
  background-color: var(--color-rule);
  color: var(--color-ink);
  border-radius: 3px;
  padding: 0.1em 0.35em;
  font-size: 0.85em;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.note-prose p.is-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--color-ink-faint);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
