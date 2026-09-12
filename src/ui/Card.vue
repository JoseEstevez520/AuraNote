<script setup>
// Ficha de una entidad. Registro "interfaz": superficie, borde suave y radio.
defineProps({
  title: { type: String, default: '' },
  body: { type: String, default: '' },
  meta: { type: String, default: '' },
})
</script>

<template>
  <div class="ui-surface flex flex-col gap-1.5 p-4">
    <div class="flex items-baseline justify-between gap-3">
      <h4 v-if="title" class="text-[15px] font-semibold leading-snug text-ink">{{ title }}</h4>
      <span v-if="meta" class="shrink-0 text-xs text-ink-faint">{{ meta }}</span>
    </div>
    <p v-if="body" class="text-sm leading-relaxed text-ink-muted">{{ body }}</p>
  </div>
</template>
