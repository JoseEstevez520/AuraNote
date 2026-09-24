<script setup>
import Timeline from 'primevue/timeline'
import { Circle } from 'lucide-vue-next'

const items = [
  "Keep improving the quality of what's generated, both sections and artifacts",
  'Explore a dedicated model for complex SVG once one is good enough',
  'Keep experimenting with interaction: refine ambient suggestions, explore reshaping a generated block by pointing at it, or a button whose behavior is generated on click',
  'Explore self-testing from your own notes beyond the current quiz',
]
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">Roadmap</h2>

    <Timeline
      :value="items"
      class="mt-6"
      :pt="{
        root: 'flex flex-col',
        event: 'flex gap-4',
        eventOpposite: 'hidden',
        eventSeparator: 'flex flex-col items-center',
        eventMarker: 'mt-1.5 flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full border border-ink-faint bg-white',
        eventConnector: 'w-px flex-1 bg-rule',
        eventContent: 'pb-8',
      }"
    >
      <template #marker>
        <span class="mt-1.5 flex h-2.5 w-2.5 shrink-0 rounded-full border border-ink-faint bg-white"></span>
      </template>
      <template #content="{ item }">
        <p class="text-[15px] leading-relaxed text-ink-muted">{{ item }}</p>
      </template>
    </Timeline>
  </section>
</template>
