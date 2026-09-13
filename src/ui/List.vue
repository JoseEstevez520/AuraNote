<script setup>
// Lista de opciones o sugerencias.
//
// La afordancia de acción (superficie con hover + chevron) SOLO aparece si el
// elemento tiene href. Sin enlace es contenido, no un botón: mostrar una flecha
// que no lleva a ningún sitio engaña. Antes salía siempre.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <template v-for="(item, i) in items" :key="i">
      <!-- Con enlace: fila accionable -->
      <a
        v-if="item.href"
        :href="item.href"
        target="_blank"
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
      </a>

      <!-- Sin enlace: contenido con viñeta, nada de flecha ni hover -->
      <div v-else class="flex gap-2.5 px-1 py-1.5">
        <span class="mt-2 size-1.5 shrink-0 rounded-full bg-ink-faint" aria-hidden="true" />
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium text-ink">{{ item.label }}</p>
          <p v-if="item.description" class="text-xs leading-relaxed text-ink-muted">
            {{ item.description }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
