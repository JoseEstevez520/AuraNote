<script setup>
// Prosa dentro de la composición. Misma tipografía y escala que el documento,
// solo cambia el peso/color según `variant`.
const props = defineProps({
  content: { type: String, default: '' },
  variant: { type: String, default: 'body' }, // body | muted | heading | caption
})

const variantClass = {
  body: 'text-base text-ink',
  muted: 'text-base text-ink-muted',
  heading: 'text-lg font-semibold text-ink',
  caption: 'text-sm text-ink-faint',
}
</script>

<template>
  <p :class="variantClass[props.variant] || variantClass.body" class="leading-relaxed">
    {{ content }}
  </p>
</template>
