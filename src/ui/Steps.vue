<script setup>
// Procedimiento numerado. El componente del modo instructivo: cuando el texto
// dice "no sé cómo", la respuesta suele tener forma de pasos.
//
// La estructura del conector está tomada de Crayon (@crayonai/react-ui, MIT),
// que es la librería detrás de las demos de OpenUI: el número y la línea son
// hermanos dentro de una columna, y la línea crece con flex-grow. La versión
// anterior colocaba la línea en absoluto y el número se descentraba en cuanto
// el texto del paso cambiaba de alto.
defineProps({
  items: { type: Array, default: () => [] },
})
</script>

<template>
  <ol class="ui-surface flex flex-col p-4">
    <li v-for="(item, i) in items" :key="i" class="flex gap-3">
      <!-- Columna del conector: círculo + línea que crece hasta el siguiente -->
      <div class="flex flex-col items-center">
        <span
          class="flex size-6 shrink-0 items-center justify-center rounded-full border border-rule bg-white text-xs font-medium leading-none text-ink-muted"
        >
          {{ i + 1 }}
        </span>
        <span
          v-if="i < items.length - 1"
          class="w-px grow bg-rule"
          aria-hidden="true"
        />
      </div>

      <div class="min-w-0 flex-1" :class="i < items.length - 1 ? 'pb-4' : ''">
        <p class="text-sm font-medium leading-6 text-ink">{{ item.label }}</p>
        <p v-if="item.description" class="mt-0.5 text-sm leading-relaxed text-ink-muted">
          {{ item.description }}
        </p>
      </div>
    </li>
  </ol>
</template>
