<script setup>
// Recomendación o aviso. Es la voz del sistema opinando, así que se marca
// con una barra de acento en lugar de mimetizarse con el resto.
defineProps({
  content: { type: String, default: '' },
  title: { type: String, default: '' },
  tone: { type: String, default: 'info' },
})

const tonos = {
  info: { barra: 'bg-accent', fondo: 'bg-accent-soft' },
  warn: { barra: 'bg-amber-500', fondo: 'bg-amber-50' },
}
</script>

<template>
  <div
    class="flex gap-3 rounded-[var(--radius-md)] p-4"
    :class="(tonos[tone] ?? tonos.info).fondo"
  >
    <span
      class="w-0.5 shrink-0 rounded-full"
      :class="(tonos[tone] ?? tonos.info).barra"
      aria-hidden="true"
    />
    <div class="min-w-0">
      <p v-if="title" class="text-sm font-semibold text-ink">{{ title }}</p>
      <p class="text-sm leading-relaxed text-ink-muted">{{ content }}</p>
    </div>
  </div>
</template>
