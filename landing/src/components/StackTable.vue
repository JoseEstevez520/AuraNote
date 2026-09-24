<script setup>
const rows = [
  { layer: 'Frontend', choice: 'Vue 3 + Vite + TipTap (Notion-like editor with node views)' },
  { layer: 'Styling', choice: 'Tailwind + Motion' },
  { layer: 'Generation model', choice: 'gpt-4.1 (sections and artifacts)' },
  { layer: 'Router model', choice: 'gpt-4.1-mini (decides section vs. artifact)' },
  { layer: 'Renderer', choice: '@openuidev/vue-lang' },
  { layer: 'Maps', choice: 'Stadia (Alidade Smooth), iOS-like style' },
  { layer: 'Images', choice: 'Unsplash' },
  { layer: 'Icons', choice: 'Lucide' },
  { layer: 'Backend', choice: 'none, client-only app with a dev proxy for API keys' },
]
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">Stack</h2>

    <div class="mt-6 overflow-hidden rounded-md border border-rule">
      <div
        v-for="(row, i) in rows"
        :key="row.layer"
        class="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:grid-cols-[160px_1fr]"
        :class="i !== 0 ? 'border-t border-rule' : ''"
      >
        <div class="text-[13px] font-medium text-ink-faint">{{ row.layer }}</div>
        <div class="text-[14px] text-ink">{{ row.choice }}</div>
      </div>
    </div>
  </section>
</template>
