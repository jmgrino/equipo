<script setup>
  import { reactive, ref, watch, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  // import { getValidationMessages } from '@formkit/validation'
  // import IconClose from '@/components/icons/IconClose.vue'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const submitLabel = ref('')
  const pageTitle = ref('')
  const isDisabled = ref(false)
  const errorMessage = ref('')

  submitLabel.value = 'Actualizar'

  const formData = reactive({
    name: '',
    shortName: '',
    color: '#ffffff',
    stdColor: '',
  })

  // tailwindcolor.com (300)
  const stdColorNames = reactive({
    red: 'Rojo',
    orange: 'Naranja',
    amber: 'Ambar',
    yellow: 'Amarillo',
    lime: 'Lima',
    green: 'Verde',
    emerald: 'Esmeralda',
    teal: 'Verde azulado',
    cyan: 'Cian',
    sky: 'Cielo',
    blue: 'Azul',
    indigo: 'Indigo',
    violet: 'Violeta',
    purple: 'Purpura',
    fuchsia: 'Fucsia',
    pink: 'Rosa',
    rose: 'Rosado',
    stone: 'Piedra',
  })

  const stdColorHexs = reactive({
    red: '#fca5a5',
    orange: '#fdba74',
    amber: '#fcd34d',
    yellow: '#fde047',
    lime: '#bef264',
    green: '#86efac',
    emerald: '#6ee7b7',
    teal: '#5eead4',
    cyan: '#67e8f9',
    sky: '#7dd3fc',
    blue: '#93c5fd',
    indigo: '#a5b4fc',
    violet: '#c4b5fd',
    purple: '#d8b4fe',
    fuchsia: '#f0abfc',
    pink: '#f9a8d4',
    rose: '#fda4af',
    stone: '#d6d3d1',
  })

  getUser(route.params.id)

  async function getUser(id) {
    const user = await authStore.getUser(id)
    pageTitle.value = user.email
    Object.assign(formData, user)
  }

  watch(
    () => formData.stdColor,
    newValue => {
      if (newValue) {
        formData.color = stdColorHexs[newValue]
      }
    }
  )

  watch(
    () => formData.color,
    newValue => {
      if (newValue !== stdColorHexs[formData.stdColor]) {
        let newStdColor = ''
        for (let key in stdColorHexs) {
          if (stdColorHexs[key] === newValue) {
            newStdColor = key
          }
        }
        formData.stdColor = newStdColor
      }
    }
  )

  async function submitHandler() {
    isDisabled.value = true
    errorMessage.value = ''

    const { stdColor, ...userData } = formData
    await authStore.updateUser(route.params.id, userData)

    isDisabled.value = false
    router.push({ name: 'user' })
  }

  function showErrors(node) {
    // const validations = getValidationMessages(node)
    errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  }

  function cancelHandler() {
    router.back()
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-screen-sm mx-auto">
    <h1 class="text-4xl font-black ml-10 pt-10">{{ pageTitle }}</h1>
    <FormKit
      type="form"
      form-class="cs-form form-class"
      :actions="false"
      @submit="submitHandler"
      @submit-invalid="showErrors"
      validation-visibility="submit"
      :incomplete-message="false"
      :value="formData"
    >
      <FormKit
        label="Nombre"
        outer-class="col-span-2"
        input-class=""
        type="text"
        name="name"
        placeholder="Nombre"
        validation="required"
        :validation-messages="{ required: 'El Nombre es obligatorio' }"
        v-model.trim="formData.name"
      />

      <FormKit
        label="Abreviatura"
        outer-class="col-span-2"
        input-class="w-32"
        type="text"
        name="shortName"
        placeholder="Abreviatura"
        maxlength="3"
        validation="required|length:3"
        :validation-messages="{ required: 'La abreviatura es obligatoria', length: 'La abreviatura debe ser de tres lettras' }"
        v-model.trim="formData.shortName"
      />

      <FormKit
        label="Elige un color"
        outer-class="sm:col-span-2"
        type="select"
        name="colorstd"
        :options="stdColorNames"
        placeholder="Selecciona un color"
        v-model.trim="formData.stdColor"
      />

      <FormKit
        label="Personalizar tu color"
        outer-class="sm:col-span-2"
        inner-class="h-16"
        type="color"
        name="color"
        placeholder="Color de la abreviatura"
        v-model.trim="formData.color"
      />

      <div class="col-span-2 justify-self-end pt-8 grid grid-cols-2 gap-x-4">
        <FormKit
          type="button"
          label="Cancelar"
          outer-class="cancel-button"
          input-class=""
          @click="cancelHandler"
          :disabled="isDisabled"
        />

        <FormKit
          type="submit"
          :label="submitLabel"
          outer-class="submit-button"
          :disabled="isDisabled"
        />
        <span class="col-span-2 p-2 text-[red] text-xl">{{ errorMessage }}</span>
      </div>
    </FormKit>
  </div>
</template>

<style scoped>
  .form-class {
    display: grid;
    grid-template-columns: max-content 1fr;
    grid-template-rows: repeat(4, min-content);
    gap: 2rem;
    margin-top: 2.5rem;
    padding: 2.5rem;
    width: 100%;
  }

  /* @media (min-width: 768px) {
  } */
</style>
