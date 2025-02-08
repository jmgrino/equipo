<script setup>
  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'btn',
    },
  })
  const emit = defineEmits(['onClick'])
</script>

<template>
  <button
    type="button"
    :class="type"
    @click="emit('onClick')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
  .btn,
  .btn:link,
  .btn:visited {
    align-items: center;
    border-style: solid;
    border-width: 2px 2px 2px 2px;
    border-radius: 10px;
    box-shadow: 0px 17px 5px -15px rgba(0, 0, 0, 0.26);
    color: #4c4c4c;
    border-color: #999999;
    background-color: #e6e6e6;
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 1.5;
    min-width: 100px;
    padding: 4px 16px 5px 16px;
  }

  .btn:hover,
  .btn:active {
    color: var(--color-std-high);
    background-color: var(--color-std-background);
    border-color: var(--color-std-high);
  }
</style>
