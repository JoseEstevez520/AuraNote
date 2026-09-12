<script setup>
// Barra flotante que aparece al seleccionar texto.
// Patrón Notion/Medium: formato básico + las dos acciones de generación.
//
// Compacta a propósito: con etiquetas largas se desbordaba de la ventana en
// pantallas estrechas. Ahora usa iconos, oculta el texto en móvil y tippy
// tiene activado el anti-desbordamiento.
import { BubbleMenu } from '@tiptap/vue-3'
import { ref } from 'vue'
import { motion, AnimatePresence } from 'motion-v'
import { TIPOS } from '../artifact/tipos.js'

const props = defineProps({
  editor: { type: Object, required: true },
})

const emit = defineEmits(['generate-section', 'generate-artifact'])

// Mantiene la barra dentro de la ventana y la voltea si no cabe arriba.
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

// Desplegable de tipos de artefacto. El clic normal en el botón usa 'auto';
// el desplegable existe para dirigirlo cuando ya sabes qué quieres.
const abierto = ref(false)

function generarArtefacto(tipo = 'auto') {
  abierto.value = false
  emit('generate-artifact', { ...seleccionActual(), tipo })
}
</script>

<template>
  <BubbleMenu :editor="editor" :tippy-options="opcionesTippy">
    <motion.div
      :initial="{ opacity: 0, y: 6, scale: 0.97 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }"
      class="relative flex max-w-[calc(100vw-24px)] items-center gap-0.5 rounded-[var(--radius-md)] border border-rule bg-white/95 p-1 backdrop-blur"
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
        title="Convertir en sección"
        class="flex shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
        @click="emit('generate-section', seleccionActual())"
      >
        <svg class="size-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
          <rect x="2" y="2.5" width="12" height="5" rx="1.5" />
          <rect x="2" y="9.5" width="5.5" height="4" rx="1.5" />
          <rect x="9.5" y="9.5" width="4.5" height="4" rx="1.5" />
        </svg>
        <span class="hidden whitespace-nowrap sm:inline">Sección</span>
      </button>

      <!-- Botón partido: el cuerpo genera en automático, el chevron abre tipos -->
      <div class="flex shrink-0 items-center">
        <button
          type="button"
          title="Generar artefacto"
          class="flex items-center gap-1.5 rounded-l-[var(--radius-sm)] px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
          @click="generarArtefacto('auto')"
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
          <span class="hidden whitespace-nowrap sm:inline">Artefacto</span>
        </button>

        <button
          type="button"
          title="Elegir tipo de artefacto"
          class="rounded-r-[var(--radius-sm)] px-1 py-1.5 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
          :class="abierto ? 'bg-surface-hover text-ink' : ''"
          @click="abierto = !abierto"
        >
          <svg
            class="size-3 transition-transform duration-200"
            :class="abierto ? 'rotate-180' : ''"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6.5 8 10.5 12 6.5" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        <motion.div
          v-if="abierto"
          :initial="{ opacity: 0, y: -4 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, y: -4 }"
          :transition="{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }"
          class="absolute right-0 top-full z-30 mt-1.5 w-56 overflow-hidden rounded-[var(--radius-md)] border border-rule bg-white p-1"
          style="box-shadow: 0 4px 16px rgba(15, 15, 15, 0.1)"
        >
          <button
            v-for="t in TIPOS"
            :key="t.id"
            type="button"
            class="flex w-full flex-col items-start rounded-[var(--radius-sm)] px-2.5 py-1.5 text-left transition-colors hover:bg-surface-hover"
            @click="generarArtefacto(t.id)"
          >
            <span class="text-sm text-ink">{{ t.etiqueta }}</span>
            <span class="text-xs text-ink-faint">{{ t.descripcion }}</span>
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  </BubbleMenu>
</template>
