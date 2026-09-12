<script setup>
// Estructura jerárquica: carpetas, organizaciones, taxonomías.
// Acepta nodos anidados: { label, description, children: [...] }
defineProps({
  items: { type: Array, default: () => [] },
  title: { type: String, default: '' },
})

// Aplana el árbol con su profundidad para no necesitar recursión de componente.
function aplanar(nodos, nivel = 0, salida = []) {
  for (const n of nodos ?? []) {
    salida.push({ ...n, nivel })
    if (n.children?.length) aplanar(n.children, nivel + 1, salida)
  }
  return salida
}

const esCarpeta = (n) => n.children?.length || /\/$/.test(n.label ?? '')
</script>

<template>
  <div class="ui-surface overflow-hidden">
    <p v-if="title" class="border-b border-rule px-4 py-2.5 ui-eyebrow">{{ title }}</p>
    <ul class="p-2 font-mono text-[13px]">
      <li
        v-for="(n, i) in aplanar(items)"
        :key="i"
        class="flex items-baseline gap-2 rounded-[var(--radius-sm)] px-2 py-1 hover:bg-surface-hover"
        :style="{ paddingLeft: `${n.nivel * 16 + 8}px` }"
      >
        <span class="shrink-0 text-ink-faint" aria-hidden="true">
          {{ esCarpeta(n) ? '▸' : '·' }}
        </span>
        <span :class="esCarpeta(n) ? 'font-medium text-ink' : 'text-ink-muted'">
          {{ n.label }}
        </span>
        <span
          v-if="n.description"
          class="truncate font-sans text-xs text-ink-faint"
        >
          — {{ n.description }}
        </span>
      </li>
    </ul>
  </div>
</template>
