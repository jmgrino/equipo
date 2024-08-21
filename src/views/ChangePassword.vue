<script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'

  const authStore = useAuthStore()
  const router = useRouter()
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'

  const formData = reactive({
    email: '',
  })

  const submitLabel = ref('Cambiar contraseña')
  const pageTitle = ref('Cambiar contraseña')
  const isDisabled = ref(false)
  const errorMessage = ref('')
  const showConfirm = ref(true)
  const isModalOpen = ref(false)
  const modalMessage = ref('')
  const modalButtons = ref([
    {
      type: 'submit',
      label: 'OK',
    },
  ])

  const handleIconClick = (node, e) => {
    node.props.suffixIcon = node.props.suffixIcon === 'eye' ? 'eyeClosed' : 'eye'
    node.props.type = node.props.type === 'password' ? 'text' : 'password'
    showConfirm.value = !showConfirm.value
  }

  function submitHandler() {
    isDisabled.value = true
    errorMessage.value = ''

    // await wait(1000)
    authStore.changePassword(formData)

    modalMessage.value = 'Se ha enviado un mensaje de recuperación de contraseña a ' + formData.email
    isModalOpen.value = true

    isDisabled.value = false
    // console.log(authStore.errorMessage)
    // if (authStore.errorMessage === '') {
    //   router.push({ name: 'login' })
    // }
  }

  function showErrors(node) {
    // const validations = getValidationMessages(node)
    errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  }

  function dialogResult(result) {
    isModalOpen.value = false
    router.push({ name: 'login' })
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
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
      <!-- <FormKit
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

      <FormKit
        v-if="showConfirm"
        label="Repite la contraseña"
        outer-class=""
        type="password"
        name="password_confirm"
        placeholder="Contraseña"
        suffix-icon="eyeClosed"
        @suffix-icon-click="handleIconClick"
        suffix-icon-class="hover:text-color-std-high text-3xl cursor-pointer"
        validation-visibility="submit"
        :validation="[['required'], ['confirm'], ['*length', 6], ['matches', /^[\x20-\x7E]{6,}$/]]"
        :validation-messages="{
          required: 'La contraseña es obligatoria',
          length: 'La contraseña de tener como minimo 6 caracteres',
          matches: 'Hay caracters no permitidos en la contraseña',
        }"
        v-model.trim="formData.password2"
      /> -->

      <div class="send-grid">
        <FormKit
          type="submit"
          :label="submitLabel"
          outer-class="submit-button button-full-width self-end mb-0"
          :disabled="isDisabled"
        />
        <span class="ml-1 text-[red] text-xl">{{ errorMessage }}</span>
        <span class="ml-1 -mt-2 text-[red] text-2xl">{{ authStore.errorMessage }}</span>
      </div>
    </FormKit>
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
