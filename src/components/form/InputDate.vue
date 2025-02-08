<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    width: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'date',
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
    /* appearance: none; */
    /* border: 2px solid red; */
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    height: 30px;
    /* width: 18rem; */
    padding-left: 4px;
  }

  /* input[type='month'] {
    width: 18rem;
  }

  input[type='date'] {
    width: 18rem;
  } */

  input:focus {
    /* appearance: none; */
    /* outline: none; */
    outline: 1px solid var(--color-std-high);
  }
</style>
