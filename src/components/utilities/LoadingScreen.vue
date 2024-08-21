<script setup>
  const props = defineProps({
    isLoading: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <div :class="{ loader: true, fadeout: !isLoading }">{{ message }}</div>
</template>

<style scoped>
  .loader {
    background-color: #63ab97;
    background-color: #fef3c7;
    bottom: 0;
    color: white;
    color: var(--color-std-text);
    display: block;
    font-size: 32px;
    left: 0;
    overflow: hidden;
    padding-top: 40vh;
    position: fixed;
    right: 0;
    text-align: center;
    top: 0;
  }

  .fadeout {
    animation: fadeout 2s forwards;
  }

  @keyframes fadeout {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }
</style>
