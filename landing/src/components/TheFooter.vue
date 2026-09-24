<script setup>
import { Github } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t border-rule py-10">
    <div class="mx-auto flex max-w-[720px] flex-col gap-2 px-6 text-[13px] text-ink-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <p>AuraNote, a personal research project by Jose Estevez.</p>
      <a
        href="https://github.com/JoseEstevez520/AuraNote"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-ink-faint transition-colors hover:text-accent"
      >
        <Github :size="14" :stroke-width="1.4" />
        github.com/JoseEstevez520/AuraNote
      </a>
    </div>
  </footer>
</template>
