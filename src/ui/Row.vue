<script setup>
// Contenedor horizontal. Se envuelve (wrap) para no romper la columna de 720px.
const props = defineProps({
  gap: { type: [String, Number], default: 16 },
  align: { type: String, default: 'start' }, // start | center | end | stretch | baseline
})

const gapPx = (g) => (typeof g === 'number' ? `${g}px` : g)

const alignClass = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}
</script>

<template>
  <div
    class="flex flex-wrap"
    :class="alignClass[props.align] || alignClass.start"
    :style="{ gap: gapPx(gap) }"
  >
    <slot />
  </div>
</template>
