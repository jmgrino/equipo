<script setup>
  const props = defineProps({
    shortName: {
      type: Object,
      required: true,
    },
    currentShortname: {
      type: String,
      default: '???',
    },
  })
</script>

<template>
  <span
    class="inline-block text-center text-color-std text-lg font-medium w-14 pt-0.5 pb-1 rounded-full mr-1"
    :style="'background-color:' + shortName.color"
    :class="{ owner: shortName.name === currentShortname }"
    >{{ shortName.name }}</span
  >
</template>

<style scoped>
  .owner {
    @apply text-blue-700 font-bold;
  }
  /* .owner {
    @apply border border-color-std;
  } */
</style>
