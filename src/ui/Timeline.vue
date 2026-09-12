<script setup>
// Secuencia temporal. La línea vertical usa `rule`, los puntos usan `accent`
// muy discretamente (son el único elemento "interactivo-visual" de la pieza).
defineProps({
  items: { type: Array, default: () => [] }, // { label, date, description }
})
</script>

<template>
  <ol class="flex flex-col">
    <li
      v-for="(item, i) in items"
      :key="i"
      class="relative pl-6 pb-5 last:pb-0 border-l border-rule last:border-l-0"
    >
      <span
        class="absolute -left-[3.5px] top-1.5 w-[7px] h-[7px] rounded-full bg-accent"
      />
      <div class="flex flex-col gap-0.5 -mt-0.5">
        <div class="flex items-baseline gap-2">
          <span class="text-base font-semibold text-ink">{{ item.label }}</span>
          <span v-if="item.date" class="text-sm text-ink-faint">{{ item.date }}</span>
        </div>
        <span v-if="item.description" class="text-sm text-ink-muted">
          {{ item.description }}
        </span>
      </div>
    </li>
  </ol>
</template>
