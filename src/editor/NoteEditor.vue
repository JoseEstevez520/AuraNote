<script setup>
// Editor principal de la nota. Estética Notion: columna de 720px,
// sin bordes, sin sombras, sin cards. El aire vertical es el diseño.
import { onBeforeUnmount, ref } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import SelectionMenu from './SelectionMenu.vue'
import { useAutosave } from './useAutosave.js'

const emit = defineEmits(['generate-section', 'generate-artifact'])

const { status, loadDocument, scheduleSave } = useAutosave()
const isEmpty = ref(true)

const savedDoc = loadDocument()

const editor = new Editor({
  extensions: [StarterKit],
  content: savedDoc ?? '',
  editorProps: {
    attributes: {
      class: 'note-prose focus:outline-none',
      spellcheck: 'true',
    },
  },
  onUpdate: ({ editor }) => {
    isEmpty.value = editor.isEmpty
    scheduleSave(editor.getJSON())
  },
})

isEmpty.value = editor.isEmpty

onBeforeUnmount(() => {
  editor.destroy()
})

function handleGenerateSection(payload) {
  emit('generate-section', payload)
}

function handleGenerateArtifact(payload) {
  emit('generate-artifact', payload)
}
</script>

<template>
  <div class="note-column relative py-16">
    <!-- Placeholder discreto cuando el documento está vacío -->
    <p
      v-if="isEmpty"
      class="pointer-events-none absolute select-none text-ink-faint"
      style="top: 4rem"
    >
      Escribe algo…
    </p>

    <EditorContent :editor="editor" />

    <SelectionMenu
      :editor="editor"
      @generate-section="handleGenerateSection"
      @generate-artifact="handleGenerateArtifact"
    />

    <!-- Indicador de guardado, discreto, aparece y se desvanece -->
    <p
      class="fixed bottom-4 right-6 text-xs text-ink-faint transition-opacity duration-500"
      :class="status === 'saved' ? 'opacity-100' : 'opacity-0'"
    >
      Guardado
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

.note-prose p.is-editor-empty:first-child::before {
  content: '';
}
</style>
