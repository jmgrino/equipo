<script setup>
  import { useUniqueID } from './useUniqueID'

  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    options: {
      type: Array,
      required: true,
    },
    width: {
      type: String,
      default: '',
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
  })
  const model = defineModel()
  const uuid = useUniqueID().getID()
</script>

<template>
  <div :class="[horizontal ? 'input-container-horizontal' : 'input-container']">
    <label :for="uuid">{{ label }}</label>
    <select
      v-model="model"
      v-bind="$attrs"
      :id="uuid"
    >
      <option
        v-for="option in options"
        :value="option"
        :key="option"
        :selected="option === modelValue"
        :style="[width ? `width: ${width}` : '']"
      >
        {{ option }}
      </option>
    </select>
  </div>
</template>

<style scoped>
  .input-container {
    display: flex;
    flex-direction: column;
  }
  .input-container-horizontal {
    display: flex;
    flex-direction: row;
    column-gap: 8px;
  }

  select {
    appearance: none;
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    width: 100%;
    padding-left: 4px;
  }
  select:focus {
    outline: 1px solid var(--color-std-high);
  }
  select option {
    appearance: none;
    background-color: #fefce8;
  }
  select option:checked {
    appearance: none;
    background-color: #fef3c7;
  }
</style>
