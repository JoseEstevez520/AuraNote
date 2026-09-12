<script setup>
// Prosa dentro de la composición, para hilar las demás piezas.
defineProps({
  content: { type: String, default: '' },
  variant: { type: String, default: 'body' },
})

const estilos = {
  lead: 'text-[15px] leading-relaxed text-ink',
  body: 'text-sm leading-relaxed text-ink-muted',
  caption: 'text-xs leading-relaxed text-ink-faint',
}
</script>

<template>
  <p :class="estilos[variant] ?? estilos.body">{{ content }}</p>
</template>
