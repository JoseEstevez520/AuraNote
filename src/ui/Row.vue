<script setup>
// Fila horizontal. Envuelve en pantallas estrechas en lugar de desbordar.
// gap acepta 'sm'|'md'|'lg' o un número en px (tolerante a lo que emita el modelo).
defineProps({
  gap: { type: [String, Number], default: 'md' },
  align: { type: String, default: 'stretch' },
})

const escala = { sm: 8, md: 12, lg: 20 }
const gapPx = (g) => (typeof g === 'number' ? `${g}px` : `${escala[g] ?? escala.md}px`)
const alineaciones = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}
</script>

<template>
  <div
    class="flex flex-wrap [&>*]:min-w-[180px] [&>*]:flex-1"
    :class="alineaciones[align] ?? alineaciones.stretch"
    :style="{ gap: gapPx(gap) }"
  >
    <slot />
  </div>
</template>
