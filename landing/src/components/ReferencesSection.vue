<script setup>
import { ArrowUpRight } from 'lucide-vue-next'
import GoogleLogo from './icons/GoogleLogo.vue'
import NotionLogo from './icons/NotionLogo.vue'

const refs = [
  {
    name: 'Google Disco',
    icon: GoogleLogo,
    detail: 'Gemini remixes your open tabs into custom apps: the artifact idea taken to the whole browser.',
    href: 'https://labs.google/',
  },
  {
    name: 'Notion',
    icon: NotionLogo,
    detail: 'The visual language: narrow column, lots of white space, hover controls.',
    href: 'https://www.notion.so/',
  },
]
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">Inspired by, different because</h2>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <a
        v-for="ref in refs"
        :key="ref.name"
        :href="ref.href"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex flex-col gap-3 rounded-md border border-rule p-4 transition-colors hover:border-rule-strong hover:bg-surface-hover"
      >
        <div class="flex items-center justify-between">
          <span class="flex h-9 w-9 items-center justify-center rounded-sm bg-surface text-ink-muted">
            <component :is="ref.icon" class="h-4 w-4" />
          </span>
          <ArrowUpRight
            :size="15"
            :stroke-width="1.4"
            class="text-ink-faint opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-hover group-hover:opacity-100"
          />
        </div>
        <div>
          <p class="text-[15px] font-medium text-ink">{{ ref.name }}</p>
          <p class="mt-1 text-[14px] leading-relaxed text-ink-muted">{{ ref.detail }}</p>
        </div>
      </a>
    </div>

    <p class="mt-6 max-w-[640px] text-[16px] leading-relaxed text-ink-muted">
      The difference from both: here the container is the document
      itself, and what's generated lives inside it instead of in a
      separate panel, tab or window.
    </p>
  </section>
</template>
