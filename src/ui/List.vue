<script setup>
// Lista de opciones/sugerencias. Portado del patrón ListBlock + ListItem de
// Crayon (@crayonai/react-ui, MIT — la librería tras las demos de OpenUI):
// un contenedor con borde y esquinas redondeadas, y filas divididas por una
// línea (la última sin línea). Título (texto primario) + subtítulo (secundario)
// y un icono de acción a la derecha. Sin viñetas.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <!-- ListBlock -->
  <div class="overflow-hidden rounded-[var(--radius-md)] border border-rule">
    <component
      :is="item.href ? 'a' : 'div'"
      v-for="(item, i) in items"
      :key="i"
      :href="item.href || undefined"
      :target="item.href ? '_blank' : undefined"
      rel="noopener noreferrer"
      class="group flex items-center justify-between gap-3 border-b border-rule px-4 py-3 last:border-b-0 transition-colors"
      :class="item.href ? 'cursor-pointer hover:bg-surface-hover' : ''"
    >
      <!-- content -->
      <div class="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <div class="flex w-full items-baseline justify-between gap-3">
          <span class="text-sm font-medium text-ink">{{ item.label }}</span>
          <span v-if="item.meta" class="shrink-0 text-xs text-ink-faint">{{ item.meta }}</span>
        </div>
        <span v-if="item.description" class="text-sm leading-relaxed text-ink-muted">
          {{ item.description }}
        </span>
      </div>
      <!-- action icon (solo si es enlace) -->
      <svg
        v-if="item.href"
        class="size-4 shrink-0 self-center text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-accent"
        viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
        stroke-linecap="round" stroke-linejoin="round"
      >
        <path d="M6 3.5 10.5 8 6 12.5" />
      </svg>
    </component>
  </div>
</template>
