<script setup>
// Procedimiento numerado. El componente del modo instructivo: cuando el texto
// dice "no sé cómo", la respuesta suele tener forma de pasos.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <ol class="ui-surface flex flex-col divide-y divide-rule">
    <li v-for="(item, i) in items" :key="i" class="flex gap-3 p-4">
      <span
        class="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
      >
        {{ i + 1 }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-ink">{{ item.label }}</p>
        <p v-if="item.description" class="mt-0.5 text-sm leading-relaxed text-ink-muted">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
