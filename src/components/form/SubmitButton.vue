<script setup>
  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      default: 'btn',
    },
    type: {
      type: String,
      default: 'button',
    },
    disabled: {
      type: Boolean,
      default: false,
      // Parent -> :disabled="true"
    },
  })

  const emit = defineEmits(['onClick'])
</script>

<template>
  <button
    :type="type"
    :class="style"
    :disabled="disabled"
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
    fill: #ffffff;
    color: #ffffff;
    border-color: var(--color-std-high);
    background-color: var(--color-std-high);
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 1.5;
    min-width: 100px;
    padding: 4px 16px 5px 16px;
  }
  .btn:disabled {
    background-color: #f5cba7;
    border-color: #f5cba7;
    pointer-events: none;
  }

  .btn:hover,
  .btn:active {
    color: var(--color-std-high);
    background-color: var(--color-std-background);
    border-color: var(--color-std-high);
  }
</style>
