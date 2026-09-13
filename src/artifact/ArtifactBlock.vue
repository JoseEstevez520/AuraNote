<script setup>
// Node view del bloque de artefacto (Nivel 2). Renderiza el HTML generado
// dentro de un iframe aislado. Sin bordes, sin sombras: dentro de la columna
// de 720px, se siente parte del documento, no un widget pegado encima.
//
// Ver docs/ux.md (Diseño visual) y docs/arquitectura.md (Nivel 2).
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { motion } from 'motion-v'
import BlockControls from '../ui/BlockControls.vue'
import { textos } from '../i18n/index.js'
import { generateArtifactSmart } from './client.js'

const props = defineProps(nodeViewProps)

const DEFAULT_HEIGHT = 160
const iframeEl = ref(null)
const iframeHeight = ref(DEFAULT_HEIGHT)
const collapsed = ref(false)
const hovering = ref(false)

const status = computed(() => props.node.attrs.status)
const html = computed(() => props.node.attrs.html)
const source = computed(() => props.node.attrs.source)
const errorMessage = computed(() => props.node.attrs.error)

// Mensajes rotativos para que el estado de carga se sienta honesto: el
// artefacto tarda 10-30s de verdad, así que un spinner mudo sería engañoso.
const loadingIndex = ref(0)
let loadingTimer = null

function startLoadingMessages() {
  loadingIndex.value = 0
  loadingTimer = setInterval(() => {
    loadingIndex.value = (loadingIndex.value + 1) % textos.value.artifact.loading.length
  }, 3000)
}
function stopLoadingMessages() {
  if (loadingTimer) clearInterval(loadingTimer)
  loadingTimer = null
}

const loadingMessage = computed(() => textos.value.artifact.loading[loadingIndex.value])

// El srcdoc del iframe. sandbox="allow-scripts" SIN allow-same-origin: es
// código generado, el aislamiento es obligatorio y esa combinación
// anularía el sandbox (el iframe podría acceder al mismo origen).
const srcdoc = computed(() => html.value || '<!doctype html><html><body></body></html>')

async function run() {
  props.updateAttributes({ status: 'loading', error: null })
  startLoadingMessages()
  try {
    // El resto de la nota como contexto de fondo: se extrae del documento
    // completo del editor, si está disponible.
    const fullNote = props.editor ? props.editor.getText() : ''
    const generatedHtml = await generateArtifactSmart(source.value, fullNote, props.node.attrs.kind)
    props.updateAttributes({ html: generatedHtml, status: 'ready', error: null })
  } catch (err) {
    props.updateAttributes({ status: 'error', error: err.message || String(err) })
  } finally {
    stopLoadingMessages()
  }
}

onMounted(() => {
  if (status.value === 'loading' && !html.value) {
    run()
  }
})

onBeforeUnmount(() => {
  stopLoadingMessages()
  window.removeEventListener('message', onMessage)
})

// Auto-ajuste de altura: el HTML generado puede notificar su altura real
// via postMessage. Si no lo hace, ResizeObserver dentro del iframe (mismo
// documento srcdoc) sirve de respaldo cuando el navegador lo permite.
function onMessage(event) {
  const data = event.data
  if (data && data.type === 'artifact:resize' && typeof data.height === 'number') {
    // Solo aceptamos mensajes de nuestro propio iframe.
    if (iframeEl.value && event.source === iframeEl.value.contentWindow) {
      iframeHeight.value = Math.max(80, Math.min(2000, Math.round(data.height) + 4))
    }
  }
}
window.addEventListener('message', onMessage)

function onIframeLoad() {
  // Respaldo: si el HTML generado no manda postMessage, intentamos leer
  // scrollHeight directamente. Con sandbox sin allow-same-origin esto
  // normalmente falla silenciosamente (cross-origin), así que dejamos la
  // altura por defecto en ese caso.
  try {
    const doc = iframeEl.value?.contentDocument
    if (doc && doc.body) {
      const h = doc.body.scrollHeight
      if (h > 0) iframeHeight.value = Math.max(80, Math.min(2000, h + 4))
    }
  } catch {
    // Cross-origin esperado: el sandbox está haciendo su trabajo.
  }
}

function regenerate() {
  run()
}

function remove() {
  if (typeof props.deleteNode === 'function') {
    props.deleteNode()
  } else if (props.getPos) {
    props.editor
      .chain()
      .focus()
      .deleteRange({ from: props.getPos(), to: props.getPos() + props.node.nodeSize })
      .run()
  }
}

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

watch(status, (s) => {
  if (s === 'loading') startLoadingMessages()
  else stopLoadingMessages()
})
</script>

<template>
  <NodeViewWrapper
    class="artifact-block group relative my-4"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <BlockControls
      :visible="hovering"
      :plegado="collapsed"
      con-plegar
      @regenerar="regenerate"
      @plegar="toggleCollapsed"
      @borrar="remove"
    />

    <!-- Estado: cargando -->
    <div v-if="status === 'loading'" class="flex items-center gap-2 py-3 text-sm text-ink-faint">
      <motion.span
        :animate="{ opacity: [0.35, 1, 0.35] }"
        :transition="{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }"
        class="size-1.5 shrink-0 rounded-full bg-accent"
      />
      <span>{{ loadingMessage }}</span>
      <span class="text-ink-faint/70">· {{ textos.artifact.takesAWhile }}</span>
    </div>

    <!-- Estado: error -->
    <div v-else-if="status === 'error'" class="rounded py-6">
      <p class="text-sm text-ink">{{ textos.artifact.failed }}</p>
      <p class="mt-1 text-xs text-ink-muted">{{ errorMessage }}</p>
      <button
        class="mt-3 rounded-[var(--radius-sm)] bg-accent px-3 py-1.5 text-xs text-white transition-colors hover:bg-accent-hover"
        @click="regenerate"
      >
        {{ textos.block.retry }}
      </button>
    </div>

    <!-- Estado: listo, plegado -->
    <button
      v-else-if="collapsed"
      type="button"
      class="ui-interactive w-full px-4 py-3 text-left text-sm text-ink-muted"
      @click="toggleCollapsed"
    >
      {{ textos.artifact.collapsed }} — «{{ source.slice(0, 60) }}{{ source.length > 60 ? '…' : '' }}»
    </button>

    <!-- Estado: listo -->
    <motion.div
      v-else
      :initial="{ opacity: 0, y: 8 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }"
      class="overflow-hidden rounded-[var(--radius-md)] border border-rule"
    >
      <iframe
        ref="iframeEl"
        :srcdoc="srcdoc"
        sandbox="allow-scripts"
        class="w-full border-0 bg-white"
        :style="{ height: iframeHeight + 'px' }"
        @load="onIframeLoad"
      ></iframe>
    </motion.div>
  </NodeViewWrapper>
</template>
