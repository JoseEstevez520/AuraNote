<script setup>
// Sugerencias, opciones. Sin viñetas de caja, separación por espacio.
defineProps({
  items: { type: Array, default: () => [] }, // { label, description, href }
})
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li v-for="(item, i) in items" :key="i" class="flex flex-col">
      <a
        v-if="item.href"
        :href="item.href"
        target="_blank"
        rel="noopener noreferrer"
        class="text-base text-accent hover:underline w-fit"
      >
        {{ item.label }}
      </a>
      <span v-else class="text-base text-ink">{{ item.label }}</span>
      <span v-if="item.description" class="text-sm text-ink-muted">
        {{ item.description }}
      </span>
    </li>
  </ul>
</template>
