<script setup>
// Banco de pruebas del Nivel 2 (src/artifact/). Editor TipTap mínimo y
// propio, deliberadamente independiente de src/editor/ (en desarrollo en
// paralelo por otro agente). Sirve para probar de principio a fin:
//
//   1. seleccionar/escribir un fragmento
//   2. generar un artefacto en modo simulado (sin claves)
//   3. comprobar que el bloque insertado persiste en localStorage tras recargar
import { ref, onBeforeUnmount } from 'vue'
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { ArtifactNode, artifactClientConfig } from './artifact/index.js'

const STORAGE_KEY = 'auranote-artifact-demo-doc'

const fragment = ref('Este fin de semana quiero planear un viaje corto a Lisboa: dos días, presupuesto ajustado, y me gustaría llevar una checklist de qué meter en la maleta.')

const emptyDoc = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Escribe aquí tu nota. Selecciona un fragmento y pulsa «Generar artefacto» abajo para insertar un bloque debajo de este párrafo.',
        },
      ],
    },
  ],
}

function loadInitialDoc() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (err) {
    console.warn('No se pudo leer el documento guardado:', err)
  }
  return emptyDoc
}

const editor = new Editor({
  extensions: [StarterKit, ArtifactNode],
  content: loadInitialDoc(),
  onUpdate: ({ editor: ed }) => {
    persist(ed)
  },
})

let saveTimer = null
function persist(ed) {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    const json = ed.getJSON()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
    lastSavedAt.value = new Date().toLocaleTimeString()
  }, 300)
}

const lastSavedAt = ref(null)

function insertArtifact() {
  if (!fragment.value.trim()) return
  editor
    .chain()
    .focus('end')
    .insertContent({
      type: 'artifactBlock',
      attrs: {
        html: null,
        source: fragment.value.trim(),
        status: 'loading',
        createdAt: new Date().toISOString(),
      },
    })
    .run()
  persist(editor)
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
  window.location.reload()
}

onBeforeUnmount(() => {
  editor.destroy()
})
</script>

<template>
  <div class="mx-auto max-w-[720px] px-6 py-10">
    <h1 class="mb-1 text-lg font-semibold text-ink">Banco de pruebas — Nivel 2: el artefacto</h1>
    <p class="mb-6 text-sm text-ink-muted">
      Modo simulado: <strong>{{ artifactClientConfig.hasApiKey ? 'desactivado (hay clave real)' : 'activado (sin VITE_LLM_API_KEY)' }}</strong>.
      Modelo configurado: <code>{{ artifactClientConfig.model }}</code>
    </p>

    <div class="mb-6 rounded border border-rule p-4">
      <label class="mb-2 block text-xs font-medium text-ink-muted">Fragmento a convertir en artefacto</label>
      <textarea
        v-model="fragment"
        rows="3"
        class="w-full resize-none border-0 bg-transparent text-sm text-ink outline-none"
      ></textarea>
      <div class="mt-2 flex items-center gap-2">
        <button
          class="rounded bg-accent px-3 py-1.5 text-sm text-white hover:opacity-90"
          @click="insertArtifact"
        >
          Generar artefacto
        </button>
        <button class="text-xs text-ink-faint hover:text-ink-muted" @click="clearStorage">
          Borrar documento guardado y recargar
        </button>
        <span v-if="lastSavedAt" class="ml-auto text-xs text-ink-faint">Guardado {{ lastSavedAt }}</span>
      </div>
    </div>

    <div class="note-column px-0">
      <EditorContent :editor="editor" class="prose-note" />
    </div>
  </div>
</template>

<style scoped>
.prose-note :deep(p) {
  margin: 0.5em 0;
}
</style>
