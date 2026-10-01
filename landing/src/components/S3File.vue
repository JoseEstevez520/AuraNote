<script setup>
const fileUrl =
  'https://jose-workshop-static-files.s3.us-east-1.amazonaws.com/mockup-reference.png'
</script>

<template>
  <section class="py-14 sm:py-16">
    <h2 class="text-[22px] font-semibold text-ink">From Amazon S3</h2>
    <p class="mt-4 max-w-[640px] text-[16px] leading-relaxed text-ink-muted">
      This image is stored in an S3 bucket and served straight to the page,
      while Amplify keeps building and hosting the site.
    </p>
    <img
      :src="fileUrl"
      alt="AuraNote mockup served from Amazon S3"
      class="mt-6 w-full rounded-md border border-rule"
      width="720"
    />
  </section>
</template>
