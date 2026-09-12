<script setup>
// Tabla comparativa. Contenedor con radio y cabecera sobre superficie.
defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="overflow-hidden rounded-[var(--radius-md)] border border-rule">
    <table class="w-full border-collapse text-sm">
      <thead v-if="columns.length">
        <tr class="bg-surface">
          <th
            v-for="(col, i) in columns"
            :key="i"
            class="border-b border-rule px-4 py-2.5 text-left text-xs font-semibold text-ink-muted"
          >
            {{ col }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, r) in rows"
          :key="r"
          class="transition-colors last:[&>td]:border-b-0 hover:bg-surface"
        >
          <td
            v-for="(cell, c) in row"
            :key="c"
            class="border-b border-rule px-4 py-2.5 align-top"
            :class="c === 0 ? 'font-medium text-ink' : 'text-ink-muted'"
          >
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
