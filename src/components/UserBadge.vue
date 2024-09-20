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
  <!-- <span
    class="text-color-std text-lg font-medium me-2 px-2.5 pt-0.5 pb-1 rounded-full"
    :style="'background-color:' + shortName.color"
    :class="{ owner: shortName.name === currentShortname }"
    >{{ shortName.name }}</span
  > -->
  <!-- <span
    class="bg-blue-100 text-blue-800 text-lg font-medium me-2 px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300"
    :class="{ owner: shortName === currentShortname }"
    >{{ shortName }}</span
  > -->
</template>

<style scoped>
  .owner {
    @apply text-blue-700 font-bold;
  }
  /* .owner {
    @apply border border-color-std;
  } */
</style>
