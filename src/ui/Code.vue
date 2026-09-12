<script setup>
// Bloque de código o comandos. Sin resaltado de sintaxis a propósito:
// añade ruido de color a un diseño que se apoya en la tinta.
defineProps({
  content: { type: String, default: '' },
  language: { type: String, default: '' },
})
</script>

<template>
  <div class="overflow-hidden rounded-[var(--radius-md)] border border-rule bg-surface">
    <p v-if="language" class="border-b border-rule px-4 py-2 ui-eyebrow">{{ language }}</p>
    <pre class="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-ink"><code>{{ content }}</code></pre>
  </div>
</template>
