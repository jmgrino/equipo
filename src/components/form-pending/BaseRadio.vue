<script setup>
  import { useUniqueID } from './useUniqueID'

  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    error: {
      type: String,
      default: '',
    },
  })

  const model = defineModel()
  const uuid = useUniqueID().getID()
</script>

<template>
  <input
    v-model="model"
    v-bind="$attrs"
    :id="uuid"
    type="radio"
    class="element-style"
  />
  <label
    v-if="label"
    :for="uuid"
  >
    {{ label }}
  </label>
  <BaseErrorMessage
    v-if="error"
    :id="`${uuid}-error`"
  >
    {{ error }}
  </BaseErrorMessage>
</template>
