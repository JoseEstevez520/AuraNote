<script setup>
// Agrupación con encabezado opcional. Sin caja: el título es solo tipografía,
// separado por espacio y una línea sutil (rule), nunca un borde alrededor del bloque.
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="flex flex-col gap-3">
    <header v-if="title" class="border-b border-rule pb-2">
      <h3 class="text-sm font-semibold text-ink-muted uppercase tracking-wide">
        {{ title }}
      </h3>
    </header>
    <div class="flex flex-col gap-3">
      <slot />
    </div>
  </section>
</template>
