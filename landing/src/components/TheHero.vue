<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import { Github, ArrowUpRight } from 'lucide-vue-next'
import mockup from '../../mockup-reference.png'
import BodyText from './BodyText.vue'

const showMore = ref(false)
</script>

<template>
  <section class="pt-20 pb-16 sm:pt-28 sm:pb-20">

    <h1 class="text-[32px] sm:text-[40px] font-semibold leading-[1.15] tracking-tight text-ink">
      The interface a note deserves isn't designed in advance: it emerges
      from what you write.
    </h1>

    <BodyText class="mt-6 max-w-[560px]">
      AuraNote is an exploration of generative interfaces on top of study
      notes. You select a fragment of text, and the model turns it into the
      interface it deserves: a living section, or an interactive artifact.
    </BodyText>

    <BodyText v-if="showMore" class="mt-3 max-w-[560px]">
      No templates, no fixed layouts: every generated section is a direct
      response to the note it came from.
    </BodyText>

    <button
      type="button"
      class="mt-3 text-[14px] font-medium text-accent-hover"
      @click="showMore = !showMore"
    >
      {{ showMore ? 'Show less' : 'Read more' }}
    </button>

    <div class="mt-8">
      <a
        href="https://github.com/JoseEstevez520/AuraNote"
        target="_blank"
        rel="noopener noreferrer"
        class="group inline-block"
      >
        <Button
          as="span"
          class="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-rule-strong bg-white px-4 py-2 text-[14px] font-medium text-ink transition-colors group-hover:border-accent-border group-hover:text-accent-hover"
        >
          <Github :size="16" :stroke-width="1.4" />
          <span>View on GitHub</span>
          <ArrowUpRight
            :size="14"
            :stroke-width="1.4"
            class="text-ink-faint transition-colors group-hover:text-accent-hover"
          />
        </Button>
      </a>
    </div>

    <figure class="mt-14 overflow-hidden rounded-md border border-rule bg-surface">
      <img
        :src="mockup"
        alt="AuraNote product concept mockup: a study note document with a generated interactive section"
        class="block w-full"
      />
    </figure>
    <figcaption class="mt-3 text-[13px] text-ink-faint">
      Early concept mockup: a note, mid-generation.
    </figcaption>
  </section>
</template>
