<script setup>
import TheHero from './components/TheHero.vue'
import WhatItIs from './components/WhatItIs.vue'
import WhatItIsNot from './components/WhatItIsNot.vue'
import HowItWorks from './components/HowItWorks.vue'
import StackTable from './components/StackTable.vue'
import StatusSection from './components/StatusSection.vue'
import RoadmapSection from './components/RoadmapSection.vue'
import ReferencesSection from './components/ReferencesSection.vue'
import TheFooter from './components/TheFooter.vue'
</script>

<template>
  <div class="min-h-screen bg-white">
    <main class="mx-auto max-w-[720px] px-6 sm:px-8">
      <TheHero />
      <WhatItIs />
      <WhatItIsNot />
      <HowItWorks />
      <StackTable />
      <StatusSection />
      <RoadmapSection />
      <ReferencesSection />
    </main>
    <TheFooter />
  </div>
</template>
