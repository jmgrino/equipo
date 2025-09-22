import { ref, reactive } from 'vue'

export function useValidation(inputErrorTable) {
  let errors = reactive({})
  const errorMessage = ref('')
  const alreadySubmitted = ref(false)

  const defaultValues = {
    required: 'El campo es obligatorio',
    maxChars: 'No puede tener mas de {setValue} caracteres',
    minChars: 'Debe tener al menos {setValue} caracteres',
    numChars: 'Ha de tener {setValue} caracteres exactamente',
    min: 'Debe ser mayor que {setValue}',
    max: 'Debe ser menor que {setValue}',
    email: 'Formato inválido',
    badInput: 'Valor invalido',
    pattern: 'Formato (regex) inválido',
  }

  const errorTable = { ...inputErrorTable, default: defaultValues }

  function processElemError(elemId, errorName, status, errorInfo) {
    // console.log('processElemError', elemId, errorName, status)
    // console.log('errorInfo', errorInfo)

    let errorId
    errorId = elemId.split('$')[0]
    if (elemId.includes('$$') && alreadySubmitted.value) {
      elemId = elemId.split('$$')[0]
    }

    if (status === false) {
      if (errors[elemId]) {
        delete errors[elemId]
      }
      if (errors[elemId + '$$']) {
        delete errors[elemId + '$$']
      }
    } else {
      if (elemId.includes('$$')) {
        if (errors[elemId]) {
          delete errors[elemId]
        }
      } else {
        if (errors[elemId + '$$']) {
          delete errors[elemId + '$$']
        }
      }

      if (errorTable[errorId]) {
        if (!errorTable[errorId][errorName]) {
          errorId = 'default'
        }
      } else {
        errorId = 'default'
      }

      if (errorTable[errorId]) {
        if (errorTable[errorId][errorName]) {
          if (status) {
            let errorText = errorTable[errorId][errorName]
            if (errorText.includes('{setValue}')) {
              errorText = errorText.replace('{setValue}', errorInfo.setValue)
            }
            if (errorText.includes('{actualValue}')) {
              errorText = errorText.replace('{actualValue}', errorInfo.actualValue)
            }
            errors[elemId] = errorText
          } else {
            delete errors[elemId]
          }
        }
      }
    }

    if (Object.keys(errors).length === 0) {
      errorMessage.value = ''
    } else {
      if (alreadySubmitted.value) {
        errorMessage.value = 'No se puede enviar porque hay errores en el formulario'
      }
    }
    // console.log('ERRORS:', errors)
  }

  function formHasErrors(formData) {
    if (Object.keys(errors).length !== 0) {
      for (const key in errors) {
        if (key.includes('$$')) {
          const newKey = key.split('$$')[0]
          errors[newKey] = errors[key]
          delete errors[key]
        }
      }
      alreadySubmitted.value = true
      errorMessage.value = 'No se puede enviar porque hay errores en el formulario'
      return true
    } else {
      return false
    }
  }

  return { processElemError, errors, errorMessage, formHasErrors }
}
