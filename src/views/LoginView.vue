<script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'

  const authStore = useAuthStore()
  const router = useRouter()

  const formData = reactive({
    // email: 'jmgrino@gmail.com',
    // password: 'pepito',
    email: '',
    password: '',
  })

  const submitLabel = ref('Entrar')
  const pageTitle = ref('Login')
  const isDisabled = ref(false)
  const errorMessage = ref('')

  const handleIconClick = (node, e) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
  }

  async function submitHandler() {
    isDisabled.value = true
    errorMessage.value = ''

    // await wait(1000)
    authStore.login(formData)

    isDisabled.value = false
    if (authStore.errorMessage === '') {
      router.push({ name: 'rides' })
    }
  }

  function showErrors(node) {
    // const validations = getValidationMessages(node)
    errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function changePassword() {
    router.push({ name: 'changePassword' })
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-2xl mx-auto">
    <h1 class="text-4xl font-black ml-10 pt-10">{{ pageTitle }}</h1>
    <FormKit
      type="form"
      form-class="cs-form mt-10 p-10 w-full login-grid"
      :actions="false"
      @submit="submitHandler"
      @submit-invalid="showErrors"
      :incomplete-message="false"
      :value="formData"
    >
      <FormKit
        label="Correo electrónico"
        outer-class=""
        type="email"
        name="email"
        placeholder="Nombre de usuario"
        validation="required"
        :validation-messages="{ required: 'El Nombre de usuario es obligatorio' }"
        v-model.trim="formData.email"
      />
      <FormKit
        label="Contraseña"
        outer-class=""
        type="password"
        name="password"
        placeholder="Contraseña"
        suffix-icon="eyeClosed"
        @suffix-icon-click="handleIconClick"
        suffix-icon-class="hover:text-color-std-high text-3xl cursor-pointer"
        validation-visibility="submit"
        :validation="[['required'], ['*length', 6], ['matches', /^[\x20-\x7E]{6,}$/]]"
        :validation-messages="{
          required: 'La contraseña es obligatoria',
          length: 'La contraseña de tener como minimo 6 caracteres',
          matches: 'Hay caracters no permitidos en la contraseña',
        }"
        v-model.trim="formData.password"
      />

      <div class="send-grid">
        <FormKit
          type="submit"
          :label="submitLabel"
          outer-class="submit-button button-full-width self-end mb-0"
          :disabled="isDisabled"
        />
        <span class="ml-1 text-[red] text-xl">{{ errorMessage }}</span>
        <span class="ml-1 -mt-2 text-[red] text-2xl">{{ authStore.errorMessage }}</span>
        <span
          class="ml-1 mt-2 text-2xl hover:text-color-std-high cursor-pointer"
          @click="changePassword"
          >¿Has olvidado la contraseña?</span
        >
      </div>
    </FormKit>
  </div>
</template>

<style scoped>
  /* grid gap-8 grid-cols-1 grid-rows-4 */

  .login-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, min-content);
    row-gap: 16px;
  }
  .send-grid {
    display: grid;
    grid-template-rows: repeat(3, min-content);
    margin-top: 16px;
  }
</style>
