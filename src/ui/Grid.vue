<script setup>
// Rejilla simple de columnas iguales. Sigue viviendo dentro de los 720px,
// así que `cols` alto en textos largos puede apretar demasiado: úsalo con criterio.
const props = defineProps({
  cols: { type: [String, Number], default: 2 },
  gap: { type: [String, Number], default: 16 },
})

const gapPx = (g) => (typeof g === 'number' ? `${g}px` : g)
</script>

<template>
  <div
    class="grid"
    :style="{ gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`, gap: gapPx(gap) }"
  >
    <slot />
  </div>
</template>
