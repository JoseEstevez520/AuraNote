<script setup>
// Dato suelto destacado. Nada de caja: el tamaño tipográfico es lo que lo resalta.
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  unit: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col gap-0.5">
    <div class="flex items-baseline gap-1">
      <span class="text-3xl font-semibold text-ink">{{ value }}</span>
      <span v-if="unit" class="text-base text-ink-muted">{{ unit }}</span>
    </div>
    <span v-if="label" class="text-sm text-ink-muted">{{ label }}</span>
  </div>
</template>
