<script setup>
import { X } from 'lucide-vue-next'

const items = [
  {
    title: 'Not an assistant living in the note',
    detail: 'no side chat, no summarizing, no correcting.',
  },
  {
    title: 'Not a dashboard of widgets',
    detail: 'no pre-built blocks waiting for a keyword.',
  },
  {
    title: 'Not "insert a block"',
    detail: 'the user never picks a component from a menu.',
  },
  {
    title: 'Not autocomplete',
    detail: "it doesn't write for you.",
  },
]
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">What this is not</h2>

    <ul class="mt-6 space-y-4">
      <li
        v-for="item in items"
        :key="item.title"
        class="flex items-start gap-3"
      >
        <span
          class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-surface text-ink-faint"
        >
          <X :size="13" :stroke-width="1.4" />
        </span>
        <p class="text-[16px] leading-relaxed text-ink-muted">
          <span class="font-medium text-ink">{{ item.title }}:</span>
          {{ item.detail }}
        </p>
      </li>
    </ul>
  </section>
</template>
