<script setup>
  import { onMounted } from 'vue'
  import { useUniqueID } from './useUniqueID'

  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['elemError'])

  const model = defineModel()
  const uuid = useUniqueID().getID()
</script>

<template>
  <div :class="[horizontal ? 'element-container-horizontal' : 'element-container']">
    <label :for="uuid">{{ label }}</label>
    <div>
      <input
        v-model="model"
        v-bind="$attrs"
        :id="uuid"
        type="color"
        :style="[width ? `width: ${width}` : '']"
        class="element-style"
      />
    </div>
  </div>
</template>

<style scoped>
  .element-container {
    display: flex;
    flex-direction: column;
    height: 48px;
  }
  .element-container-horizontal {
    display: flex;
    flex-direction: row;
    column-gap: 8px;
  }
  .element-style {
    appearance: none;
    outline: 1px solid var(--color-std);
    outline-offset: -4px;
    border-radius: 4px;
    height: 32px;
    line-height: 1.5;
    margin-top: -5px;
    height: 42px;
    width: 65px;
  }

  .element-style::-webkit-color-swatch {
    appearance: none;
    border: none;
  }

  .element-style:focus {
    outline: 1px solid var(--color-std-high);
    outline-offset: -4px;
  }
</style>
