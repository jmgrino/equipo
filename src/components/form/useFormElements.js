import AcceptButton from './AcceptButton.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseErrorMessage from './BaseErrorMessage.vue'
import BaseInput from './BaseInput.vue'
import BaseInputColor from './BaseInputColor.vue'
import BaseInputDate from './BaseInputDate.vue'
import BaseInputPassword from './BaseInputPassword.vue'
import BaseSelect from './BaseSelect.vue'
import BaseTextarea from './BaseTextarea.vue'
import CancelButton from './CancelButton.vue'
import BaseInputFile from './BaseInputFile.vue'

// import BaseRadio from './BaseRadio.vue'
// import BaseRadioGroup from './BaseRadioGroup.vue'

export function useFormElements() {
  function register(app) {
    app.component('AcceptButton', AcceptButton)
    app.component('BaseCheckbox', BaseCheckbox)
    app.component('BaseErrorMessage', BaseErrorMessage)
    app.component('BaseInput', BaseInput)
    app.component('BaseInputColor', BaseInputColor)
    app.component('BaseInputDate', BaseInputDate)
    app.component('BaseInputPassword', BaseInputPassword)
    app.component('BaseSelect', BaseSelect)
    app.component('BaseTextarea', BaseTextarea)
    app.component('CancelButton', CancelButton)
    app.component('BaseInputFile', BaseInputFile)

    // app.component('BaseRadio', BaseRadio)
    // app.component('BaseRadioGroup', BaseRadioGroup)
  }

  return { register }
}
