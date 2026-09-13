<script setup>
// Foto por consulta (miniatura o imagen de apoyo), desde Unsplash.
import { ref, onMounted } from 'vue'
import { buscarFoto, marcarUso } from './unsplash.js'

const props = defineProps({
  query: { type: String, default: '' },
  caption: { type: String, default: '' },
})

const foto = ref(null)
onMounted(async () => {
  foto.value = await buscarFoto(props.query || props.caption)
  if (foto.value) marcarUso(foto.value.descarga)
})
</script>

<template>
  <figure class="overflow-hidden rounded-[var(--radius-md)] border border-rule bg-surface">
    <div class="aspect-[16/10] w-full">
      <img
        v-if="foto"
        :src="foto.thumb"
        :alt="caption || query"
        class="h-full w-full object-cover"
        loading="lazy"
      />
      <div v-else class="h-full w-full animate-pulse bg-surface-hover" />
    </div>
    <figcaption v-if="caption" class="px-3 py-2 text-xs text-ink-muted">{{ caption }}</figcaption>
  </figure>
</template>
