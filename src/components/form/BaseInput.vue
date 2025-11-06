<script setup>
  import { onMounted, useTemplateRef, watchEffect } from 'vue'
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
    minChars: {
      type: String,
      required: false,
    },
    numChars: {
      type: String,
      required: false,
    },
  })

  const emit = defineEmits(['elemError'])

  const model = defineModel()
  const uuid = useUniqueID().getID()

  const inputRef = useTemplateRef('input-ref')
  defineExpose({ inputRef })

  let errorStatus = {
    maxChars: {
      errorValue: false,
      showMessage: true,
    },
    minChars: {
      errorValue: false,
      showMessage: false,
    },
    numChars: {
      errorValue: false,
      showMessage: false,
    },
    email: {
      errorValue: false,
      showMessage: false,
    },
    min: {
      errorValue: false,
      showMessage: false,
    },
    max: {
      errorValue: false,
      showMessage: false,
    },
    pattern: {
      errorValue: false,
      showMessage: false,
    },
    required: {
      errorValue: false,
      showMessage: false,
    },
  }

  let LastErrorReported = 'any'
  const errorId = props.errorId
  const errorId$ = props.errorId + '$$' // Show error at submit

  onMounted(() => {
    if (props.errorId) {
      let errorInfo = {}
      const inputElem = document.getElementById(uuid)

      if (inputElem.hasAttribute('required')) {
        const unwatch = watchEffect(() => {
          if (model.value && errorStatus.required.errorValue) {
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

        if (props.minChars) {
          errorInfo = {
            errorName: 'minChars',
            errorValue: event.target.value.length < +props.minChars,
            setValue: props.minChars,
            actualValue: event.target.value.length,
          }
          errorStatus.minChars.errorValue = errorInfo.errorValue
          errorStatus.minChars.errorInfo = structuredClone(errorInfo)
        }

        if (props.numChars) {
          errorInfo = {
            errorName: 'numChars',
            errorValue: event.target.value.length !== +props.numChars,
            setValue: props.numChars,
            actualValue: event.target.value.length,
          }
          errorStatus.numChars.errorValue = errorInfo.errorValue
          errorStatus.numChars.errorInfo = structuredClone(errorInfo)
        }

        if (inputElem.hasAttribute('type')) {
          if (inputElem.type === 'email') {
            errorInfo = {
              errorName: 'email',
              errorValue: inputElem.validity.typeMismatch,
              setValue: '',
              actualValue: '',
            }
            errorStatus.email.errorValue = errorInfo.errorValue
            errorStatus.email.errorInfo = structuredClone(errorInfo)
          }
        }

        if (inputElem.hasAttribute('min')) {
          errorInfo = {
            errorName: 'min',
            errorValue: inputElem.value < inputElem.min,
            setValue: inputElem.min,
            actualValue: inputElem.value,
          }
          errorStatus.min.errorValue = errorInfo.errorValue
          errorStatus.min.errorInfo = structuredClone(errorInfo)
        }

        if (inputElem.hasAttribute('max')) {
          errorInfo = {
            errorName: 'max',
            errorValue: inputElem.value > inputElem.max,
            setValue: inputElem.max,
            actualValue: inputElem.value,
          }
          errorStatus.max.errorValue = errorInfo.errorValue
          errorStatus.max.errorInfo = structuredClone(errorInfo)
        }

        if (inputElem.hasAttribute('pattern')) {
          errorInfo = {
            errorName: 'pattern',
            errorValue: inputElem.validity.patternMismatch,
            setValue: '',
            actualValue: '',
          }
          errorStatus.pattern.errorValue = errorInfo.errorValue
          errorStatus.pattern.errorInfo = structuredClone(errorInfo)
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
  }
</script>

<template>
  <div :class="[horizontal ? 'element-container-horizontal' : 'element-container']">
    <label :for="uuid">{{ label }}</label>
    <div>
      <input
        ref="input-ref"
        v-model="model"
        v-bind="$attrs"
        :id="uuid"
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
    appearance: none;
    border: none;
    outline: 1px solid var(--color-std);
    border-radius: 4px;
    margin-left: 1px;
    width: 100%;
    padding-left: 4px;
    height: 32px;
    line-height: 1.5;
  }

  .element-style:focus {
    outline: 1px solid var(--color-std-high);
  }

  .element-style.error-style {
    outline: 1px solid red;
  }
</style>
