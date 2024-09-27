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
    top: {
      type: String,
      default: 0,
    },
    params: {
      type: Object,
      required: false,
    },
  })

  const styleString = computed(() => {
    return `width:${props.size};height:${props.size};margin-top:${props.top};cursor:default;`
  })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :style="styleString + params.style"
    :xml:space="params.xml_space"
    :width="params.width"
    :height="params.height"
    :viewBox="params.viewBox"
    class="cursor-help"
  >
    <title>{{ title }}</title>
    <slot></slot>
  </svg>
</template>

<style scoped></style>
