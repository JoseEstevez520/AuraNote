<script setup>
// Portada: una foto de fondo con el título encima. El componente que da el
// look "revista" tipo OpenUI. La foto viene de Unsplash por consulta.
import { ref, onMounted } from 'vue'
import { buscarFoto, marcarUso } from './unsplash.js'

const props = defineProps({
  title: { type: String, default: '' },
  query: { type: String, default: '' },
  subtitle: { type: String, default: '' },
})

const foto = ref(null)
onMounted(async () => {
  foto.value = await buscarFoto(props.query || props.title)
  if (foto.value) marcarUso(foto.value.descarga)
})
</script>

<template>
  <div
    class="relative flex min-h-[180px] items-end overflow-hidden rounded-[var(--radius-md)] border border-rule"
    :style="foto ? '' : 'background: linear-gradient(135deg, var(--color-accent-soft), #eef2f7 60%, #f6efe8)'"
  >
    <img
      v-if="foto"
      :src="foto.url"
      :alt="title"
      class="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
    />
    <!-- Degradado para que el texto se lea sobre la foto -->
    <div
      v-if="foto"
      class="absolute inset-0"
      style="background: linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.05) 55%, transparent)"
    />
    <div class="relative z-10 p-5">
      <h3
        class="text-2xl font-semibold tracking-tight"
        :class="foto ? 'text-white' : 'text-ink'"
      >
        {{ title }}
      </h3>
      <p v-if="subtitle" class="mt-1 text-sm" :class="foto ? 'text-white/85' : 'text-ink-muted'">
        {{ subtitle }}
      </p>
    </div>
    <!-- Atribución (requisito de Unsplash) -->
    <a
      v-if="foto"
      :href="foto.autorUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="absolute bottom-1.5 right-2 z-10 text-[10px] text-white/60 hover:text-white/90"
    >
      {{ foto.autor }} / Unsplash
    </a>
  </div>
</template>
