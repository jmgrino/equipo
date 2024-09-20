<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useRidesStore } from '@/stores/ridesStore'

  const authStore = useAuthStore()
  const ridesStore = useRidesStore()
  const router = useRouter()
  const message = ref('')

  async function init() {
    if (!navigator.onLine) return 'offline'

    const validUser = await authStore.checkValidUserData()

    if (!validUser) return false

    ridesStore.getRides()
    ridesStore.getDates()
    ridesStore.getUsers()

    await ridesStore.validData()

    const restimeout = await wait(5000)
    return 'ok'
  }

  message.value = ''

  Promise.race([init(), wait(100)]).then(result => {
    if (result === 'ok') {
      router.push({ name: 'rides' })
    } else if (result === 'offline') {
      message.value = 'No hay conexión a Internet'
    } else {
      message.value = 'El servidor tarda mucho en responder. Intentalo de nuevo mas tarde'
    }
  })

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms, 'timeout'))
  }
</script>

<template>
  <div class="container">
    <div v-if="message">
      <h2 class="text-cs-h2">{{ message }}</h2>
    </div>
    <div
      v-else
      class="loader"
    ></div>
  </div>
</template>

<style scoped>
  .container {
    position: absolute;
    top: 0;
    height: calc(100vh + var(--header-height));
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .loader {
    width: fit-content;
    font-weight: bold;
    font-family: sans-serif;
    font-size: 30px;
    padding-bottom: 8px;
    background: linear-gradient(currentColor 0 0) 0 100%/0% 3px no-repeat;
    animation: l2 2s linear infinite;
  }
  .loader:before {
    content: 'Obteniendo datos...';
  }
  @keyframes l2 {
    to {
      background-size: 100% 3px;
    }
  }
</style>
