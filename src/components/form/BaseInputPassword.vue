<script setup>
  import { ref, onMounted } from 'vue'
  import { useUniqueID } from './useUniqueID'
  import IconEye from '@/components/icons/IconEye.vue'
  import IconEyeClosed from '@/components/icons/IconEyeClosed.vue'

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
  })

  const emit = defineEmits(['elemError'])

  const model = defineModel()
  const uuid = useUniqueID().getID()

  const showPassword = ref(false)

  // console.log('UseId', useId())

  let errorStatus = {
    maxChars: {
      errorValue: false,
      showMessage: true,
    },
    minChars: {
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

  let LastErrorReported = ''
  let inputElem
  const errorId = props.errorId
  const errorId$ = props.errorId + '$$' // Show error at submit

  onMounted(() => {
    if (props.errorId) {
      let errorInfo = {}
      // let firstTime = true

      inputElem = document.getElementById(uuid)

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
        // if (firstTime) {
        //   // Initialization
        // }

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
      emit('elemError', errorId, 'any', false)
      LastErrorReported = ''
    }

    // console.log('errorStatus', errorId, errorStatus)
  }

  function togglePwd() {
    showPassword.value = !showPassword.value
    if (showPassword.value) {
      inputElem.type = 'text'
    } else {
      inputElem.type = 'password'
    }
    inputElem.focus()
  }
</script>

<template>
  <div :class="[horizontal ? 'element-container-horizontal' : 'element-container']">
    <label :for="uuid">{{ label }}</label>
    <div class="input-container">
      <input
        v-model="model"
        v-bind="$attrs"
        :id="uuid"
        type="password"
        :aria-describedby="error ? `${uuid}-error` : null"
        :aria-invalid="error ? true : false"
        :style="[width ? `width: ${width}` : '']"
        :class="[error ? 'error-style' : '']"
        class="element-style"
      />
      <div
        class="eye"
        @click="togglePwd"
      >
        <IconEye
          v-if="!showPassword"
          class="icon"
          size="2.4rem"
          title="Ver contraseña"
        />
        <IconEyeClosed
          v-if="showPassword"
          class="icon"
          size="2.4rem"
          title="Esconder contraseña"
        />
      </div>
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

  .input-container {
    position: relative;
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
    padding-right: 30px;
  }

  .element-style::-ms-reveal,
  .element-style::-ms-clear {
    display: none;
  }

  .element-style:focus {
    outline: 1px solid var(--color-std-high);
  }

  .element-style.error-style {
    outline: 1px solid red;
  }

  .eye {
    position: absolute;
    top: -2px;
    right: 2px;
  }

  .icon {
    cursor: pointer;
    display: inline-block;
  }

  .icon:hover {
    color: var(--color-std-high);
  }
</style>
