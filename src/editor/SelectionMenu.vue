<script setup>
// Barra flotante al seleccionar texto: formato básico + UN botón "Generar".
// El modelo decide qué generar (sección o interactivo); el usuario no elige
// entre opciones. Ver docs/interaccion.md
import { BubbleMenu } from '@tiptap/vue-3'
import { motion } from 'motion-v'
import { textos } from '../i18n/index.js'

const props = defineProps({
  editor: { type: Object, required: true },
})
const emit = defineEmits(['generate'])

const opcionesTippy = {
  duration: 120,
  placement: 'top',
  maxWidth: 'none',
  popperOptions: {
    modifiers: [
      { name: 'preventOverflow', options: { padding: 12, altAxis: true } },
      { name: 'flip', options: { padding: 12, fallbackPlacements: ['bottom'] } },
    ],
  },
}

function seleccionActual() {
  const { from, to } = props.editor.state.selection
  return { text: props.editor.state.doc.textBetween(from, to, ' '), from, to }
}

const alternar = (marca) => props.editor.chain().focus()[marca]().run()
</script>

<template>
  <BubbleMenu :editor="editor" :tippy-options="opcionesTippy">
    <motion.div
      :initial="{ opacity: 0, y: 6, scale: 0.97 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }"
      class="flex max-w-[calc(100vw-24px)] items-center gap-0.5 rounded-[var(--radius-md)] border border-rule bg-white/95 p-1 backdrop-blur"
      style="box-shadow: 0 4px 16px rgba(15, 15, 15, 0.08)"
    >
      <button
        v-for="b in [
          { m: 'toggleBold', k: 'bold', t: 'B', c: 'font-semibold' },
          { m: 'toggleItalic', k: 'italic', t: 'I', c: 'italic' },
          { m: 'toggleCode', k: 'code', t: '</>', c: 'font-mono text-xs' },
        ]"
        :key="b.k"
        type="button"
        class="rounded-[var(--radius-sm)] px-2 py-1 text-sm text-ink transition-colors hover:bg-surface-hover"
        :class="[b.c, editor.isActive(b.k) ? 'text-accent' : '']"
        @click="alternar(b.m)"
      >
        {{ b.t }}
      </button>

      <span class="mx-1 h-4 w-px shrink-0 bg-rule" />

      <button
        type="button"
        class="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-1 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
        @click="emit('generate', seleccionActual())"
      >
        <svg
          class="size-4"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
          stroke-linejoin="round"
        >
          <path d="M8 1.8l1.7 3.9 4.2.4-3.2 2.8.96 4.1L8 10.9l-3.66 2.1.96-4.1L2.1 6.1l4.2-.4z" />
        </svg>
        <span class="whitespace-nowrap">{{ textos.menu.generate }}</span>
      </button>
    </motion.div>
  </BubbleMenu>
</template>
