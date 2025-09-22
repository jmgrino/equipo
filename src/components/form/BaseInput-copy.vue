<script setup>
  import { onMounted, getCurrentInstance } from 'vue'
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

  // console.log('UseId', useId())

  onMounted(() => {
    if (props.errorId) {
      let requiredError
      let maxCharsError
      let minCharsError
      let numCharsError
      let minError
      let maxError
      let mismatchError
      let patternError
      let requiredErrorOld
      let maxCharsErrorOld
      let minCharsErrorOld
      let numCharsErrorOld
      let minErrorOld
      let maxErrorOld
      let mismatchErrorOld
      let patternErrorOld
      const errorId = props.errorId
      const errorId$ = props.errorId + '$$' // Show error at submit
      let errorInfo = {}
      let firstTime = true
      const inputElem = document.getElementById(uuid)

      errorInfo = {
        validity: inputElem.validity,
      }

      if (inputElem.hasAttribute('required')) {
        console.log('Initial required error', errorId$)
        emit('elemError', errorId$, 'required', true, errorInfo)
      }

      inputElem.addEventListener('input', event => {
        console.log('===================', errorId)
        if (firstTime) {
          requiredErrorOld = false
          maxCharsErrorOld = false
          minErrorOld = false
          maxErrorOld = false
          mismatchErrorOld = false
          patternErrorOld = false

          firstTime = false
        }

        errorInfo = {
          event,
          setValue: '',
          actualValue: '',
          validity: inputElem.validity,
        }

        if (props.maxChars) {
          errorInfo.setValue = props.maxChars
          errorInfo.actualValue = event.target.value.length

          maxCharsError = event.target.value.length > +props.maxChars
          if (maxCharsError !== maxCharsErrorOld) {
            emit('elemError', errorId, 'maxChars', maxCharsError, errorInfo)
            maxCharsErrorOld = maxCharsError
          } else if (props.verbose && maxCharsError) {
            emit('elemError', errorId, 'maxChars', maxCharsError, errorInfo)
          }
        }

        if (props.minChars) {
          errorInfo.setValue = props.minChars
          errorInfo.actualValue = event.target.value.length

          minCharsError = event.target.value.length < +props.minChars
          if (minCharsError !== minCharsErrorOld) {
            emit('elemError', errorId$, 'minChars', minCharsError, errorInfo)
            if (minCharsError === false) {
              emit('elemError', errorId, 'minChars', minCharsError, errorInfo)
            }
            minCharsErrorOld = minCharsError
          } else if (props.verbose && minCharsError) {
            emit('elemError', errorId, 'minChars', minCharsError, errorInfo)
          }
        }

        if (props.numChars) {
          errorInfo.setValue = props.numChars
          errorInfo.actualValue = event.target.value.length

          numCharsError = event.target.value.length !== +props.numChars
          if (numCharsError !== numCharsErrorOld) {
            emit('elemError', errorId$, 'numChars', numCharsError, errorInfo)
            if (numCharsError === false) {
              emit('elemError', errorId, 'numChars', numCharsError, errorInfo)
            }
            numCharsErrorOld = numCharsError
          } else if (props.verbose && numCharsError) {
            emit('elemError', errorId, 'numChars', numCharsError, errorInfo)
          }
        }

        if (inputElem.hasAttribute('type')) {
          if (inputElem.type === 'email') {
            mismatchError = inputElem.validity.typeMismatch
            console.log('email', mismatchError, mismatchErrorOld)
            if (mismatchError !== mismatchErrorOld) {
              console.log('emit email')
              emit('elemError', errorId$, 'mismatch', mismatchError, errorInfo)
              if (mismatchError === false) {
                emit('elemError', errorId, 'mismatch', mismatchError, errorInfo)
              }
              mismatchErrorOld = mismatchError
            }
          }
        }

        if (inputElem.hasAttribute('required')) {
          requiredError = inputElem.validity.valueMissing
          console.log('required', requiredError, requiredErrorOld)
          if (requiredError !== requiredErrorOld) {
            console.log('emit required')
            emit('elemError', errorId, 'required', requiredError, errorInfo)
            requiredErrorOld = requiredError
          }
          if (requiredError === false) {
            emit('elemError', errorId$, 'required', requiredError, errorInfo)
          }
        }

        if (inputElem.hasAttribute('min')) {
          errorInfo.setValue = inputElem.min
          errorInfo.actualValue = inputElem.value

          minError = inputElem.value < inputElem.min
          if (minError !== minErrorOld) {
            emit('elemError', errorId, 'min', minError, errorInfo)
            minErrorOld = minError
          } else if (props.verbose && minError) {
            emit('elemError', errorId, 'min', minError, errorInfo)
          }
        }

        if (inputElem.hasAttribute('max')) {
          errorInfo.setValue = inputElem.max
          errorInfo.actualValue = inputElem.value

          maxError = inputElem.value > inputElem.max
          if (maxError !== maxErrorOld) {
            emit('elemError', errorId, 'max', maxError, errorInfo)
            maxErrorOld = maxError
          } else if (props.verbose && maxError) {
            emit('elemError', errorId, 'max', maxError, errorInfo)
          }
        }

        if (inputElem.hasAttribute('pattern')) {
          patternError = inputElem.validity.patternMismatch
          if (patternError !== patternErrorOld) {
            emit('elemError', errorId$, 'pattern', patternError, errorInfo)
            if (patternError === false) {
              emit('elemError', errorId, 'pattern', patternError, errorInfo)
            }
            patternErrorOld = patternError
          }
        }
        //
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
