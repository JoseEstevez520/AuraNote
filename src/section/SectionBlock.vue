<script setup>
// Node view del Nivel 1 — la sección generada.
//
// Renderiza el openui-lang con el Renderer oficial contra nuestra librería,
// así que solo puede pintar piezas de src/ui/: pase lo que pase, encaja con
// el documento. Dentro de la columna, sin bordes ni sombras.
import { ref, computed, onMounted } from 'vue'
import { NodeViewWrapper } from '@tiptap/vue-3'
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
      class="absolute -top-2 right-0 flex gap-3 opacity-0 transition-opacity group-hover:opacity-100"
    >
      <button class="text-xs text-ink-faint hover:text-accent" @click="regenerar">
        Regenerar
      </button>
      <button class="text-xs text-ink-faint hover:text-accent" @click="deleteNode">Borrar</button>
    </div>

    <p v-if="estado === 'loading'" class="text-sm text-ink-faint">Componiendo la sección…</p>

    <div v-else-if="estado === 'error'" class="text-sm">
      <p class="text-ink-muted">No se pudo generar: {{ node.attrs.error }}</p>
      <button class="mt-1 text-xs text-accent" @click="regenerar">Reintentar</button>
    </div>

    <template v-else>
      <Renderer :response="node.attrs.lang" :library="library" :on-error="(e) => (errores = e)" />
      <p v-if="errores.length" class="mt-2 text-xs text-ink-faint">
        {{ errores.length }} aviso(s) del renderer: {{ errores.map((e) => e.code).join(', ') }}
      </p>
    </template>
  </NodeViewWrapper>
</template>
