import SubmitButton from '@/components/form/SubmitButton.vue'
import CancelButton from '@/components/form/CancelButton.vue'

import InputText from '@/components/form/InputText.vue'
import InputDate from '@/components/form/InputDate.vue'
import InputCheckbox from '@/components/form/InputCheckbox.vue'
import InputFile from '@/components/form/InputFile.vue'

export function useFormElements() {
  function register(app) {
    app.component('SubmitButton', SubmitButton)
    app.component('CancelButton', CancelButton)
    app.component('InputText', InputText)
    app.component('InputDate', InputDate)
    app.component('InputCheckbox', InputCheckbox)
    app.component('InputFile', InputFile)
  }

  return { register }
}
