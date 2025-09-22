<script setup>
  import { onMounted } from 'vue'
  import { useUniqueID } from './useUniqueID'

  const props = defineProps({
    label: {
      type: String,
      default: '',
    },
    errorId: {
      type: String,
      required: false,
    },
    error: {
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

  onMounted(() => {
    if (props.errorId) {
      let requiredError
      let requiredErrorOld
      let badInputError
      let badInputErrorOld

      const errorId = props.errorId
      // const errorId$ = props.errorId + '$$' // Show error at submit
      let errorInfo = {}
      let firstTime = true
      const inputElem = document.getElementById(uuid)

      inputElem.addEventListener('input', event => {
        if (firstTime) {
          requiredErrorOld = false
          badInputErrorOld = false

          firstTime = false
        }

        errorInfo = {
          event,
          setValue: '',
          actualValue: '',
          validity: inputElem.validity,
        }

        badInputError = inputElem.validity.badInput
        if (badInputError !== badInputErrorOld) {
          emit('elemError', errorId, 'badInput', badInputError, errorInfo)
          badInputErrorOld = badInputError
        }

        if (inputElem.hasAttribute('required')) {
          requiredError = inputElem.validity.valueMissing
          if (requiredError !== requiredErrorOld) {
            emit('elemError', errorId, 'required', requiredError, errorInfo)
            requiredErrorOld = requiredError
          }
        }
      })
    }
  })
</script>

<template>
  <div :class="[horizontal ? 'element-container-horizontal' : 'element-container']">
    <label :for="uuid">{{ label }}</label>
    <div>
      <input
        v-model="model"
        v-bind="$attrs"
        :id="uuid"
        type="date"
        :aria-describedby="error ? `${uuid}-error` : null"
        :aria-invalid="error ? true : false"
        :style="[width ? `width: ${width}` : '']"
        :class="[error ? 'error-style' : '']"
        class="element-style"
      />
      <BaseErrorMessage
        v-if="error"
        :id="`${uuid}-error`"
      >
        {{ error }}
      </BaseErrorMessage>
    </div>
  </div>
</template>

<style scoped>
  .element-container {
    display: flex;
    flex-direction: column;
  }
  .element-container-horizontal {
    display: flex;
    flex-direction: row;
    column-gap: 8px;
  }
  .element-style {
    border: none;
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    width: 87%;
    padding-left: 4px;
    height: 32px;
    line-height: 1.5;
    background-color: transparent;
  }

  .element-style:focus {
    outline: 1px solid var(--color-std-high);
  }

  .element-style.error-style {
    outline: 1px solid red;
  }

  @media (max-width: 480px) {
    .element-style {
      min-width: 150px;
    }
    input::-internal-datetime-container {
      background-color: red;
    }
  }
</style>
