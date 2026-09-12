<script setup>
// Fila horizontal. Envuelve en pantallas estrechas en lugar de desbordar:
// la columna del documento es de 720px y no siempre caben dos piezas anchas.
defineProps({
  gap: { type: String, default: 'md' },
  align: { type: String, default: 'stretch' },
})

const huecos = { sm: 'gap-2', md: 'gap-3', lg: 'gap-5' }
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
    :class="[huecos[gap] ?? huecos.md, alineaciones[align] ?? alineaciones.stretch]"
  >
    <slot />
  </div>
</template>
