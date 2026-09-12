<script setup>
// Barra flotante que aparece al seleccionar texto.
// Patrón Notion/Medium: formato básico + dos acciones de generación
// que por ahora solo emiten eventos, sin funcionalidad real.
import { BubbleMenu } from '@tiptap/vue-3'

const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['generate-section', 'generate-artifact'])

function currentSelection() {
  const { from, to } = props.editor.state.selection
  const text = props.editor.state.doc.textBetween(from, to, ' ')
  return { text, from, to }
}

function toggleBold() {
  props.editor.chain().focus().toggleBold().run()
}

function toggleItalic() {
  props.editor.chain().focus().toggleItalic().run()
}

function toggleCode() {
  props.editor.chain().focus().toggleCode().run()
}

function onGenerateSection() {
  emit('generate-section', currentSelection())
}

function onGenerateArtifact() {
  emit('generate-artifact', currentSelection())
}
</script>

<template>
  <BubbleMenu
    :editor="editor"
    :tippy-options="{ duration: 100 }"
    class="flex items-center gap-1 rounded-lg bg-white px-1.5 py-1 shadow-sm ring-1 ring-rule"
  >
    <button
      type="button"
      class="rounded px-2 py-1 text-sm font-semibold text-ink hover:bg-rule"
      :class="{ 'text-accent': editor.isActive('bold') }"
      @click="toggleBold"
    >
      B
    </button>
    <button
      type="button"
      class="rounded px-2 py-1 text-sm italic text-ink hover:bg-rule"
      :class="{ 'text-accent': editor.isActive('italic') }"
      @click="toggleItalic"
    >
      I
    </button>
    <button
      type="button"
      class="rounded px-2 py-1 font-mono text-sm text-ink hover:bg-rule"
      :class="{ 'text-accent': editor.isActive('code') }"
      @click="toggleCode"
    >
      &lt;/&gt;
    </button>

    <span class="mx-1 h-4 w-px bg-rule"></span>

    <button
      type="button"
      class="whitespace-nowrap rounded px-2 py-1 text-sm text-ink-muted hover:bg-rule hover:text-ink"
      @click="onGenerateSection"
    >
      Convertir en sección
    </button>
    <button
      type="button"
      class="whitespace-nowrap rounded px-2 py-1 text-sm text-ink-muted hover:bg-rule hover:text-ink"
      @click="onGenerateArtifact"
    >
      Generar artefacto
    </button>
  </BubbleMenu>
</template>
