<script setup>
// Línea temporal. Raíl continuo con nodos; el último no prolonga el raíl.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <ol class="ui-surface flex flex-col px-4 py-1">
    <li
      v-for="(item, i) in items"
      :key="i"
      class="relative flex gap-3 py-3"
      :class="i < items.length - 1 ? 'pb-4' : ''"
    >
      <!-- Raíl: se corta en el último nodo -->
      <span
        v-if="i < items.length - 1"
        class="absolute left-[5px] top-[18px] bottom-0 w-px bg-rule"
        aria-hidden="true"
      />
      <span
        class="relative z-10 mt-[7px] size-[11px] shrink-0 rounded-full border-2 border-white bg-accent"
        aria-hidden="true"
      />
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2">
          <p class="text-sm font-semibold text-ink">{{ item.label }}</p>
          <span v-if="item.date" class="text-xs text-ink-faint">{{ item.date }}</span>
        </div>
        <p v-if="item.description" class="text-sm leading-relaxed text-ink-muted">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
