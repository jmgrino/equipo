<script setup>
  import HeroIconStd from './HeroIconStd.vue'

  const props = defineProps({
    size: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
  })
</script>

<template>
  <HeroIconStd
    :size="props.size"
    :title="props.title"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </HeroIconStd>
</template>

<style scoped></style>
