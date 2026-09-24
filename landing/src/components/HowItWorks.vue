<script setup>
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

const rows = [
  { label: 'When', section: 'SEE: show or organize information', artifact: 'DO: interact, or a custom visual' },
  { label: 'Examples', section: 'map, itinerary, comparison', artifact: 'simulator, quiz, diagram, model' },
  {
    label: 'Output',
    section: "goes through the app's own Vue component library (openui-lang)",
    artifact: 'free-form HTML',
  },
  { label: 'Renders as', section: 'native Vue components', artifact: 'sandboxed <iframe>' },
  { label: 'Guarantee', section: "always matches the app's design", artifact: 'can be almost anything' },
]
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">How it works</h2>

    <p class="mt-5 max-w-[620px] text-[16px] leading-relaxed text-ink-muted">
      One gesture, two outcomes. Press "Generate" on a selected
      fragment, and a small router model
      (<code class="rounded-sm bg-surface px-1.5 py-0.5 text-[14px] text-ink">gpt-4.1-mini</code>)
      decides which of two things is more valuable. You never choose
      between options yourself. The big model
      (<code class="rounded-sm bg-surface px-1.5 py-0.5 text-[14px] text-ink">gpt-4.1</code>)
      only generates when it's actually needed. When in doubt, the
      router picks "section".
    </p>

    <!-- comparison table: "generated register" styling, bordered card, radius -->
    <div class="mt-8 overflow-hidden rounded-md border border-rule">
      <div class="grid grid-cols-[100px_1fr_1fr] gap-px bg-rule sm:grid-cols-[120px_1fr_1fr]">
        <div class="bg-surface p-3"></div>
        <div class="flex items-center gap-2 bg-surface p-3">
          <Tag
            class="rounded-sm bg-white px-2 py-1 text-[12px] font-medium text-ink"
            value="Section"
          />
        </div>
        <div class="flex items-center gap-2 bg-surface p-3">
          <Tag
            class="rounded-sm bg-white px-2 py-1 text-[12px] font-medium text-ink"
            value="Artifact (widget)"
          />
        </div>

        <template v-for="row in rows" :key="row.label">
          <div class="bg-white p-3 text-[13px] font-medium text-ink-faint">
            {{ row.label }}
          </div>
          <div class="bg-white p-3 text-[14px] leading-snug text-ink-muted">
            {{ row.section }}
          </div>
          <div class="bg-white p-3 text-[14px] leading-snug text-ink-muted">
            {{ row.artifact }}
          </div>
        </template>
      </div>
    </div>

    <p class="mt-4 text-[15px] italic text-ink-muted">
      The section shows; the artifact lets you touch it.
    </p>

    <Divider class="my-10 h-px w-full border-0 bg-rule" />

    <h3 class="text-[17px] font-semibold text-ink">Why two modes, not one</h3>
    <p class="mt-4 max-w-[620px] text-[16px] leading-relaxed text-ink-muted">
      The section is the safety net: everyday stuff always looks good
      because it's built from your own pieces. The artifact is the
      ambition, sandboxed, able to attempt almost anything. The technical
      thesis is the same in both directions: use the smallest model that
      solves each task. The mini router classifies and routes; the big
      model only generates when actually asked to.
    </p>

    <blockquote
      class="mt-6 rounded-md border border-rule bg-surface px-5 py-4 text-[16px] leading-relaxed text-ink"
    >
      "Your component library is the document's vocabulary.
      The artifact is that vocabulary's escape hatch."
    </blockquote>
  </section>
</template>
