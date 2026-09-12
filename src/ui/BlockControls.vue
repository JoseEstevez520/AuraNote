<script setup>
// Controles de un bloque generado. Mismo lenguaje que la barra de selección:
// pastilla flotante, borde suave, fondo translúcido. Aparece al pasar por
// encima del bloque y no ocupa sitio cuando no está.
//
// Antes eran enlaces de texto sueltos flotando sobre el contenido y quedaban
// mal: sin fondo, sin agrupación y pisando lo generado.
import { motion, AnimatePresence } from 'motion-v'

defineProps({
  visible: { type: Boolean, default: false },
  plegado: { type: Boolean, default: false },
  // Si es false no se muestra el botón de plegar (las secciones no se pliegan).
  conPlegar: { type: Boolean, default: false },
})

const emit = defineEmits(['regenerar', 'plegar', 'borrar'])
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      :initial="{ opacity: 0, y: 4 }"
      :animate="{ opacity: 1, y: 0 }"
      :exit="{ opacity: 0, y: 4 }"
      :transition="{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }"
      class="absolute -top-3 right-1 z-20 flex items-center gap-0.5 rounded-[var(--radius-sm)] border border-rule bg-white/95 p-0.5 backdrop-blur"
      style="box-shadow: 0 2px 10px rgba(15, 15, 15, 0.07)"
    >
      <button
        type="button"
        title="Regenerar"
        class="rounded-[6px] p-1.5 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
        @click="emit('regenerar')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <path d="M13.5 8a5.5 5.5 0 1 1-1.7-3.97" />
          <path d="M13.6 2.4v2.9h-2.9" />
        </svg>
      </button>

      <button
        v-if="conPlegar"
        type="button"
        :title="plegado ? 'Expandir' : 'Plegar'"
        class="rounded-[6px] p-1.5 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
        @click="emit('plegar')"
      >
        <svg
          class="size-3.5 transition-transform duration-200"
          :class="plegado ? '' : 'rotate-180'"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 6.5 8 10.5 12 6.5" />
        </svg>
      </button>

      <span class="mx-0.5 h-3.5 w-px bg-rule" />

      <button
        type="button"
        title="Borrar"
        class="rounded-[6px] p-1.5 text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
        @click="emit('borrar')"
      >
        <svg
          class="size-3.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        >
          <path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M5 4.5l.5 8h5l.5-8" />
        </svg>
      </button>
    </motion.div>
  </AnimatePresence>
</template>
