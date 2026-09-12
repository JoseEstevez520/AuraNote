<script setup>
// Dato destacado. Se presenta como baldosa para que varios en Row formen
// una fila de métricas coherente.
defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], default: '' },
  unit: { type: String, default: '' },
})
</script>

<template>
  <div class="ui-surface flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3">
    <div class="flex items-baseline gap-1">
      <span class="text-2xl font-semibold tracking-tight text-ink">{{ value }}</span>
      <span v-if="unit" class="text-sm font-medium text-ink-faint">{{ unit }}</span>
    </div>
    <span v-if="label" class="truncate text-xs text-ink-muted">{{ label }}</span>
  </div>
</template>
