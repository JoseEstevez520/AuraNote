<script setup>
// Lista de opciones. Cada fila es accionable: superficie con hover y chevron.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <component
      :is="item.href ? 'a' : 'div'"
      v-for="(item, i) in items"
      :key="i"
      :href="item.href"
      :target="item.href ? '_blank' : undefined"
      rel="noopener noreferrer"
      class="ui-interactive group flex items-center gap-3 px-4 py-3"
    >
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-medium text-ink">{{ item.label }}</p>
        <p v-if="item.description" class="truncate text-xs text-ink-muted">
          {{ item.description }}
        </p>
      </div>
      <svg
        class="size-4 shrink-0 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 3.5 10.5 8 6 12.5" />
      </svg>
    </component>
  </div>
</template>
