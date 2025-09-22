<script setup>
  import { onMounted, watchEffect } from 'vue'
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
    verbose: {
      type: Boolean,
      default: false,
    },
    horizontal: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '',
    },
    maxChars: {
      type: String,
      required: false,
    },
  })

  const emit = defineEmits(['elemError'])

  const model = defineModel()
  const uuid = useUniqueID().getID()

  let errorStatus = {
    maxChars: {
      errorValue: false,
      showMessage: true,
    },
    required: {
      errorValue: false,
      showMessage: false,
    },
  }

  let LastErrorReported = ''
  const errorId = props.errorId
  const errorId$ = props.errorId + '$$' // Show error at submit

  onMounted(() => {
    if (props.errorId) {
      let errorInfo = {}
      const inputElem = document.getElementById(uuid)

      if (inputElem.hasAttribute('required')) {
        const unwatch = watchEffect(() => {
          if (model.value && errorStatus.required.errorValue) {
            // console.log('Delete required error')
            errorInfo = {
              errorName: 'required',
              errorValue: false,
              setValue: '',
              actualValue: '',
            }
            errorStatus.required.errorValue = errorInfo.errorValue
            errorStatus.required.errorInfo = structuredClone(errorInfo)
            unwatch()
            reportError()
          }
        })
      }

      if (inputElem.hasAttribute('required')) {
        // console.log('set ini required', inputElem.validity.valueMissing)
        errorInfo = {
          errorName: 'required',
          errorValue: inputElem.validity.valueMissing,
          setValue: '',
          actualValue: '',
        }
        errorStatus.required.errorValue = errorInfo.errorValue
        errorStatus.required.errorInfo = structuredClone(errorInfo)
      }
      reportError()

      inputElem.addEventListener('input', event => {
        if (props.maxChars) {
          errorInfo = {
            errorName: 'maxChars',
            errorValue: event.target.value.length > +props.maxChars,
            setValue: props.maxChars,
            actualValue: event.target.value.length,
          }
          errorStatus.maxChars.errorValue = errorInfo.errorValue
          errorStatus.maxChars.errorInfo = structuredClone(errorInfo)
        }

        if (inputElem.hasAttribute('required')) {
          errorInfo = {
            errorName: 'required',
            errorValue: inputElem.validity.valueMissing,
            setValue: '',
            actualValue: '',
          }
          errorStatus.required.errorValue = errorInfo.errorValue
          errorStatus.required.errorInfo = structuredClone(errorInfo)
        }

        reportError()
        //
      })
    }
  })

  function reportError() {
    let eventSent = false
    for (let errorName in errorStatus) {
      const showMessage = errorStatus[errorName].showMessage
      if (showMessage) {
        if (errorStatus[errorName].errorValue) {
          if (errorStatus[errorName] !== LastErrorReported) {
            emit('elemError', errorId, errorName, true, errorStatus[errorName].errorInfo)
            LastErrorReported = errorStatus[errorName]
          }
          eventSent = true
          break
        }
      }
    }

    if (!eventSent) {
      for (let errorName in errorStatus) {
        const showMessage = errorStatus[errorName].showMessage
        if (!showMessage) {
          if (errorStatus[errorName].errorValue) {
            if (errorStatus[errorName] !== LastErrorReported) {
              emit('elemError', errorId$, errorName, true, errorStatus[errorName].errorInfo)
              LastErrorReported = errorStatus[errorName]
            }
            eventSent = true
            break
          }
        }
      }
    }

    if (!eventSent) {
      if ('any' !== LastErrorReported) {
        emit('elemError', errorId, 'any', false, {})
        LastErrorReported = 'any'
      }
    }

    // console.log('errorStatus', errorId, errorStatus)
  }
</script>

<template>
  <div :class="[horizontal ? 'element-container-horizontal' : 'element-container']">
    <label :for="uuid">{{ label }}</label>
    <textarea
      v-model="model"
      v-bind="$attrs"
      :id="uuid"
      :aria-describedby="error ? `${uuid}-error` : null"
      :aria-invalid="error ? true : false"
      :style="[width ? `width: ${width}` : '']"
      :class="[error ? 'error-style' : '']"
      class="element-style"
    >
    </textarea>
    <BaseErrorMessage
      v-if="error"
      :id="`${uuid}-error`"
    >
      {{ error }}
    </BaseErrorMessage>
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
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    width: 100%;
    padding-left: 4px;
  }

  .element-style:focus {
    outline: 1px solid var(--color-std-high);
  }

  .element-style.error-style {
    outline: 1px solid red;
  }
</style>
