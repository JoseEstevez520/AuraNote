<script setup>
// Agrupación con encabezado. El título va en versalitas para no competir
// con los títulos del documento.
defineProps({
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="flex flex-col gap-3">
    <h3 v-if="title" class="ui-eyebrow">{{ title }}</h3>
    <div class="flex flex-col gap-3">
      <slot />
    </div>
  </section>
</template>
