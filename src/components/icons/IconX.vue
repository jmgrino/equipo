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
      d="M6 18 18 6M6 6l12 12"
    />
  </HeroIconStd>
</template>

<style scoped></style>
