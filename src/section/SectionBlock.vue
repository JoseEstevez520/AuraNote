<script setup>
// Node view del Nivel 1 — la sección generada.
//
// Renderiza el openui-lang con el Renderer oficial contra nuestra librería,
// así que solo puede pintar piezas de src/ui/: pase lo que pase, encaja con
// el documento. Dentro de la columna, sin bordes ni sombras.
import { ref, computed, onMounted } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
import { motion, AnimatePresence } from 'motion-v'
import { Renderer } from '@openuidev/vue-lang'
import { library } from '../ui/library.js'
import { generarSeccion } from './client.js'

const props = defineProps({
  node: { type: Object, required: true },
  updateAttributes: { type: Function, required: true },
  deleteNode: { type: Function, required: true },
})

const errores = ref([])
const estado = computed(() => props.node.attrs.status)

async function regenerar() {
  props.updateAttributes({ status: 'loading', error: null })
  try {
    const lang = await generarSeccion(props.node.attrs.source, props.node.attrs.context)
    props.updateAttributes({ lang, status: 'ready', error: null })
  } catch (e) {
    props.updateAttributes({ status: 'error', error: e.message })
  }
}

// El bloque se inserta en estado 'loading' y se genera a sí mismo. Así quien
// lo inserta no tiene que rastrear su posición en el documento después.
onMounted(() => {
  if (props.node.attrs.status === 'loading' && !props.node.attrs.lang) regenerar()
})
</script>

<template>
  <NodeViewWrapper class="group relative my-6" data-section-block>
    <!-- Controles: aparecen en hover y desaparecen. Ver docs/ux.md -->
    <div
      class="absolute -top-1 right-0 z-10 flex gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
    >
      <button class="text-xs text-ink-faint transition-colors hover:text-accent" @click="regenerar">
        Regenerar
      </button>
      <button class="text-xs text-ink-faint transition-colors hover:text-accent" @click="deleteNode">
        Borrar
      </button>
    </div>

    <AnimatePresence mode="wait">
      <motion.div
        v-if="estado === 'loading'"
        key="cargando"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="{ duration: 0.15 }"
        class="flex items-center gap-2 py-2 text-sm text-ink-faint"
      >
        <motion.span
          :animate="{ opacity: [0.35, 1, 0.35] }"
          :transition="{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }"
          class="size-1.5 rounded-full bg-accent"
        />
        Componiendo la sección…
      </motion.div>

      <motion.div
        v-else-if="estado === 'error'"
        key="error"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.15 }"
        class="text-sm"
      >
        <p class="text-ink-muted">No se pudo generar: {{ node.attrs.error }}</p>
        <button class="mt-1 text-xs text-accent" @click="regenerar">Reintentar</button>
      </motion.div>

      <motion.div
        v-else
        key="listo"
        :initial="{ opacity: 0, y: 8 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
      >
        <Renderer :response="node.attrs.lang" :library="library" :on-error="(e) => (errores = e)" />
        <p v-if="errores.length" class="mt-2 text-xs text-ink-faint">
          {{ errores.length }} aviso(s) del renderer: {{ errores.map((e) => e.code).join(', ') }}
        </p>
      </motion.div>
    </AnimatePresence>
  </NodeViewWrapper>
</template>
