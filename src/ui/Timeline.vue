<script setup>
// Línea temporal. Misma estructura de conector que Steps: el nodo y la línea
// son hermanos en una columna y la línea crece, en vez de posicionarla en
// absoluto. Así el punto queda alineado con la primera línea de texto sea
// cual sea el alto del contenido.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <ol class="ui-surface flex flex-col p-4">
    <li v-for="(item, i) in items" :key="i" class="flex gap-3">
      <div class="flex flex-col items-center">
        <span
          class="mt-[7px] size-2.5 shrink-0 rounded-full border-2 border-white bg-accent"
          aria-hidden="true"
        />
        <span v-if="i < items.length - 1" class="w-px grow bg-rule" aria-hidden="true" />
      </div>

      <div class="min-w-0 flex-1" :class="i < items.length - 1 ? 'pb-4' : ''">
        <div class="flex flex-wrap items-baseline gap-x-2">
          <p class="text-sm font-semibold leading-6 text-ink">{{ item.label }}</p>
          <span v-if="item.date" class="text-xs text-ink-faint">{{ item.date }}</span>
        </div>
        <p v-if="item.description" class="text-sm leading-relaxed text-ink-muted">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
