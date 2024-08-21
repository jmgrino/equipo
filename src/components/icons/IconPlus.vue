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
      d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </HeroIconStd>
</template>

<style scoped></style>
