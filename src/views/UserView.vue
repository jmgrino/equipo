<script setup>
  import { ref, reactive } from 'vue'
  import { useAuthStore } from '@/stores/authStore'
  import { useRoute, useRouter } from 'vue-router'

  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  let user = reactive({})
  const fetching = ref(false)
  const shortNameStyle = ref('')

  getUser(route.params.id)

  async function getUser(id) {
    fetching.value = true
    user = await authStore.getUser(id)
    fetching.value = false
    shortNameStyle.value = `outline: 2px solid ${user.color}; border-radius: 15px;`
  }

  const logout = () => {
    router.push({ name: 'login' })
    authStore.logout()
  }

  const editUser = () => {
    router.push({ name: 'editUser', params: { id: user.id } })
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto p-4 user-view-grid md:max-w-full md:shadow-none">
    <span
      v-if="fetching"
      class="text-cs-h4 text-color-std-high-tint md:col-span-2"
      >Esperando datos...</span
    >
    <span
      v-else
      class="text-cs-h4 text-color-std-high-tint md:col-span-2"
      >{{ user.email }}</span
    >
    <div class="justify-self-end flex gap-5 md:col-span-2 md:row-start-1 sm:justify-self-center">
      <button
        class="btn btn-std btn-cancel"
        @click="router.push({ name: 'rides' })"
      >
        Cancelar
      </button>
      <button
        class="btn btn-std btn-submit"
        @click="editUser"
      >
        Editar
      </button>
      <button
        class="btn btn-std btn-submit"
        @click="logout"
      >
        Logout
      </button>
    </div>
    <template v-if="!fetching">
      <span class="text-cs-h3">Nombre:</span>
      <span class="text-cs-h3">{{ user.name }}</span>
      <span class="text-cs-h3">Abreviatura:</span>
      <span
        class="text-cs-h3 w-32 text-center"
        :style="shortNameStyle"
        >{{ user.shortName }}</span
      >
    </template>
  </div>
</template>

<style scoped>
  .user-view-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: max-content 1fr;
  }
</style>
