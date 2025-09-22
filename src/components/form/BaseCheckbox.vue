<script setup>
  import { useUniqueID } from './useUniqueID'

  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    error: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['inputChanged'])

  const model = defineModel()
  const uuid = useUniqueID().getID()

  function valueChanged(event) {
    model.value = event.target.checked
    emit('inputChanged', event.target.checked)
  }
</script>

<template>
  <label class="label-style"
    >{{ label }}
    <input
      v-model="model"
      v-bind="$attrs"
      :id="uuid"
      type="checkbox"
      @change="valueChanged"
      class="element-style"
    />
    <span class="checkmark"></span>
  </label>
</template>

<style scoped>
  .label-style {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  .element-style {
    appearance: none;
    height: 0;
    width: 0;
  }

  .checkmark {
    height: 30px;
    width: 30px;
    outline: 1px solid var(--color-std);
    position: relative;
  }

  .label-style:hover .checkmark {
    outline: 1px solid var(--color-std-high);
  }

  .checkmark:after {
    display: none;
    content: '';
    position: absolute;
  }

  .element-style:checked ~ .checkmark::after {
    display: block;
  }

  .checkmark::after {
    width: 9px;
    height: 18px;
    border: solid var(--color-std-high);
    border-width: 0 3px 3px 0;
    transform: rotate(50deg);
    left: 10px;
    top: 4px;
  }
</style>
