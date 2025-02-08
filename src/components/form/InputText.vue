<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    label: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      default: 'text',
    },
    width: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
      default: false,
      // Parent -> :required="true"
    },
  })
  const model = defineModel()

  const computedStyle = computed(() => {
    let computedStyle = ''
    if (props.width != '') {
      computedStyle = `width: ${props.width};`
    }
    return computedStyle
  })
</script>

<template>
  <div class="input-container">
    <label :for="name">{{ label }}</label>
    <input
      v-model="model"
      :id="name"
      :type="type"
      :required="required"
      :style="computedStyle"
    />
  </div>
</template>

<style scoped>
  .input-container {
    display: flex;
    flex-direction: column;
  }
  input {
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    width: 100%;
  }

  input:focus {
    outline: 1px solid var(--color-std-high);
  }
</style>
