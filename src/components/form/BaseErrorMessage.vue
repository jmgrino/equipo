<script setup>
  const props = defineProps({
    id: {
      type: [String, Number],
      required: true,
    },
  })
</script>

<template>
  <p
    :id="id"
    aria-live="assertive"
    class="errorMessage"
  >
    <slot />
  </p>
</template>

<style scoped>
  .errorMessage {
    color: red;
    font-size: 14px;
  }
</style>
