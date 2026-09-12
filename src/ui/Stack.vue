<script setup>
// Contenedor vertical por defecto. La pieza de layout más usada.
defineProps({
  gap: { type: [String, Number], default: 16 },
})

const gapPx = (g) => (typeof g === 'number' ? `${g}px` : g)
</script>

<template>
  <div class="flex flex-col" :style="{ gap: gapPx(gap) }">
    <slot />
  </div>
</template>
