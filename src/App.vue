<script setup>
  import { ref } from 'vue'
  import { RouterView } from 'vue-router'
  import NavBar from '@/components/layout/NavBar.vue'
  import { useAuthStore } from '@/stores/authStore'
  import { useRidesStore } from '@/stores/ridesStore'
  import LoadingScreen from '@/components/utilities/LoadingScreen.vue'

  const authStore = useAuthStore()
  const ridesStore = useRidesStore()
  const isLoading = ref(true)
  const message = ref('')

  async function init() {
    authStore.init()
    ridesStore.getRides()
    ridesStore.getDates()
    ridesStore.getTracks()
    ridesStore.getPhotos()
    ridesStore.getUsers()

    const validUser = await authStore.checkValidUserData()

    if (!validUser) return 'offline'

    await ridesStore.validData()

    return 'ok'
  }

  message.value = 'Obteniendo datos...'

  Promise.race([init(), wait(10000)]).then(result => {
    if (result === 'ok') {
      isLoading.value = false
    } else if (result === 'offline') {
      message.value = 'No hay conexion con el servidor. Intentalo de nuevo mas tarde'
    } else {
      message.value = 'El servidor tarda mucho en responder. Intentalo de nuevo mas tarde'
    }
  })

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms, 'timeout'))
  }
</script>

<template>
  <LoadingScreen
    :isLoading="isLoading"
    :message="message"
  />
  <NavBar />
  <main
    v-if="!isLoading"
    class="main"
  >
    <RouterView />
  </main>
</template>

<style scoped>
  .main {
    padding-left: 4.8rem;
    padding-right: 4.8rem;
    margin-top: var(--header-height);
  }

  @media (max-width: 640px) {
    .main {
      padding-left: 8px;
      padding-right: 8px;
      margin-top: var(--header-height);
    }
  }
</style>
