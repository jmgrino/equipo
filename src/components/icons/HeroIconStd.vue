<script setup>
  import { computed } from 'vue'
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

  const sizeString = computed(() => {
    return `width:${props.size};height:${props.size};`
  })
</script>

<template>
  <svg
    :style="sizeString"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="hero-icon-class"
  >
    <title>{{ title }}</title>
    <slot></slot>
  </svg>
</template>

<style scoped></style>
