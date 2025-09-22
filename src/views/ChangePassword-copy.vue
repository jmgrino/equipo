<script setup>
  import { ref, reactive, nextTick, useTemplateRef } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useValidation } from '@/components/form/useValidation.js'

  const authStore = useAuthStore()
  const router = useRouter()
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'

  const formData = reactive({
    email: '',
  })

  const submitLabel = ref('Cambiar contraseña')
  const pageTitle = ref('Cambiar contraseña')
  const showConfirm = ref(true)
  const isModalOpen = ref(false)
  const modalMessage = ref('')
  const modalButtons = ref([
    {
      type: 'submit',
      label: 'OK',
    },
  ])
  const emailRef = useTemplateRef('email-ref')

  function submitHandler() {
    if (formHasErrors(formData)) return

    // await wait(1000)
    authStore.changePassword(formData)

    modalMessage.value = 'Se ha enviado un mensaje de recuperación de contraseña a ' + formData.email
    isModalOpen.value = true
  }

  function dialogResult(result) {
    isModalOpen.value = false
    router.push({ name: 'login' })
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  const { processElemError, errors, errorMessage, formHasErrors } = useValidation({
    email: {
      required: 'El correo electrónico es obligatorio',
      email: 'El formato del correo electrónico no es válido',
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
        class=""
        ref="email-ref"
        label="Correo electrónico"
        type="email"
        v-model="formData.email"
        required
        error-id="email"
        :error="errors.email"
        @elemError="processElemError"
      />

      <div class="send-grid">
        <CancelButton
          label="Cancelar"
          @onClick="router.push({ name: 'login' })"
        />
        <AcceptButton
          class="mt-4"
          :label="submitLabel"
          type="submit"
        />
        <span class="ml-1 text-[red] text-xl">{{ errorMessage }}</span>
        <span class="ml-1 -mt-2 text-[red] text-2xl">{{ authStore.errorMessage }}</span>
      </div>
    </form>
  </div>
  <ModalOverlay
    :open-dialog.sync="isModalOpen"
    header="Restaurar contraseña"
    :paragraph="modalMessage"
    :buttons="modalButtons"
    @result="dialogResult"
  ></ModalOverlay>
</template>

<style scoped>
  .login-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(3, min-content);
    row-gap: 16px;
  }
  .send-grid {
    display: grid;
    row-gap: 2px;
    grid-template-columns: repeat(1, 1fr);
    grid-template-rows: repeat(3, min-content);
    margin-top: 16px;
  }
</style>
