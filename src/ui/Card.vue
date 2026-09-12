<script setup>
// Ficha. Ojo: pese al nombre, NO lleva caja (sin borde, sin sombra, sin fondo).
// Se distingue del resto por tipografía y una línea (rule) muy sutil debajo.
defineProps({
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  meta: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col gap-1 pb-3 border-b border-rule last:border-b-0 last:pb-0">
    <h4 v-if="title" class="text-base font-semibold text-ink">{{ title }}</h4>
    <p v-if="body" class="text-base text-ink-muted leading-relaxed">{{ body }}</p>
    <span v-if="meta" class="text-sm text-ink-faint">{{ meta }}</span>
  </div>
</template>
