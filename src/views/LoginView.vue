<script setup>
  import { ref, reactive, useTemplateRef, nextTick } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useValidation } from '@/components/form/useValidation.js'

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
  const emailRef = useTemplateRef('email-ref')

  const handleIconClick = (node, e) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
  }

  async function submitHandler() {
    if (formHasErrors(formData)) return

    // await wait(1000)
    authStore.login(formData)

    if (authStore.errorMessage === '') {
      router.push({ name: 'rides' })
    }
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function changePassword() {
    router.push({ name: 'changePassword' })
  }

  const { processElemError, errors, errorMessage, formHasErrors } = useValidation({
    email: {
      required: 'El correo electrónico es obligatorio',
      email: 'El formato del correo electrónico no es válido',
    },
    password: {
      required: 'La contraseña es obligatoria',
      minChars: 'La contraseña debe tener al menos {setValue} caracteres',
      pattern: 'Hay caracteres no permitidos en la contraseña',
    },
  })

  async function setFocus() {
    await nextTick() // waits until the DOM is reset and ready
    emailRef.value.inputRef.focus()
  }

  setFocus()
</script>

<template>
  <div class="bg-white shadow-md max-w-2xl mx-auto">
    <h1 class="text-4xl font-black ml-10 pt-10">{{ pageTitle }}</h1>
    <form
      class="mt-10 p-10 w-full login-grid"
      novalidate
      @submit.prevent="submitHandler"
    >
      <BaseInput
        ref="email-ref"
        class=""
        label="Correo electrónico"
        type="email"
        v-model="formData.email"
        required
        error-id="email"
        :error="errors.email"
        @elemError="processElemError"
      />

      <BaseInputPassword
        class=""
        label="Contraseña"
        v-model="formData.password"
        minChars="6"
        pattern="^[\x20-\x7E]{6,}$"
        required
        error-id="password"
        :error="errors.password"
        @elemError="processElemError"
      />

      <div class="send-grid">
        <AcceptButton
          :label="submitLabel"
          type="submit"
        />
        <span class="ml-1 text-[red] text-xl">{{ errorMessage }}</span>
        <span class="ml-1 text-[red] text-2xl">{{ authStore.errorMessage }}</span>
        <span
          class="ml-1 mt-2 text-2xl hover:text-color-std-high cursor-pointer"
          @click="changePassword"
          >¿Has olvidado la contraseña?</span
        >
      </div>
    </form>
  </div>
</template>

<style>
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
