<script setup>
  import { reactive, ref, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useValidation } from '@/components/form/useValidation.js'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const submitLabel = ref('')
  const pageTitle = ref('')
  const isDisabled = ref(false)

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

  const userId = route.params.id
  getUser(userId)

  async function getUser(id) {
    const user = await authStore.getUser(id)
    pageTitle.value = user.name
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
    if (formHasErrors()) return

    isDisabled.value = true
    errorMessage.value = ''

    const { stdColor, ...userData } = formData

    await authStore.updateUser(userId, userData)

    isDisabled.value = false
    router.push({ name: 'user' })
  }

  function cancelHandler() {
    router.back()
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const { processElemError, errors, errorMessage, formHasErrors } = useValidation({
    name: {
      required: 'El nombre es obligatorio',
      maxChars: 'El nombre no puede tener mas de {setValue}  caracteres',
    },
    shortName: {
      required: 'La abreviatura es obligatorio',
      numChars: 'La abreviatura debe ser de tres letras',
    },
  })
</script>

<template>
  <div class="bg-white shadow-md max-w-5xl mx-auto md:max-w-full md:shadow-none">
    <h1 class="text-4xl font-black ml-10 pt-10">{{ pageTitle }}</h1>
    <form
      class="mt-5 p-10 w-full form-grid"
      novalidate
      @submit.prevent="submitHandler"
    >
      <BaseInput
        class=""
        label="Nombre"
        v-model="formData.name"
        maxChars="20"
        width="200px"
        required
        error-id="name"
        :error="errors.name"
        @elemError="processElemError"
      />
      <BaseInput
        class=""
        label="Abreviatura"
        v-model="formData.shortName"
        numChars="3"
        maxlength="3"
        width="60px"
        required
        error-id="shortName"
        :error="errors.shortName"
        @elemError="processElemError"
      />
      <BaseSelect
        class="col-start-1"
        label="Elige un color"
        :options="Object.keys(stdColorNames)"
        v-model="formData.stdColor"
        width="200px"
      />

      <BaseInputColor
        label="Personaliza tu color"
        v-model="formData.color"
        class=""
      />

      <div class="col-span-full justify-self-end pt-8 grid grid-cols-2 gap-x-4 mt-8">
        <CancelButton
          label="Cancelar"
          @onClick="cancelHandler"
        />
        <AcceptButton
          :label="submitLabel"
          type="submit"
        />

        <span class="col-span-2 p-2 text-[red] text-xl">{{ errorMessage }}</span>
      </div>
    </form>
  </div>
</template>

<style scoped>
  .form-grid {
    display: grid;
    grid-template-columns: max-content max-content 1fr;
    grid-template-rows: repeat(4, min-content);
    gap: 2rem;
    margin-top: 2.5rem;
    padding: 2.5rem;
    width: 100%;
  }

  @media (max-width: 480px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
