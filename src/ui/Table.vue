<script setup>
// Comparativas. Sin bordes de celda ni fondo alterno: solo una línea (rule)
// bajo la cabecera, como en una tabla de documento, no de app.
defineProps({
  columns: { type: Array, default: () => [] },
  rows: { type: Array, default: () => [] }, // array de arrays
})
</script>

<template>
  <table class="w-full text-left border-collapse">
    <thead>
      <tr>
        <th
          v-for="(col, i) in columns"
          :key="i"
          class="text-sm font-semibold text-ink-muted border-b border-rule pb-2 pr-4"
        >
          {{ col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, r) in rows" :key="r">
        <td
          v-for="(cell, c) in row"
          :key="c"
          class="text-base text-ink border-b border-rule py-2 pr-4"
        >
          {{ cell }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
