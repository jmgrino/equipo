<script setup>
  import { reactive, ref, computed, watch } from 'vue'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useRouter, useRoute } from 'vue-router'
  // import { getValidationMessages } from '@formkit/validation'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const pageTitle = ref('')
  let ride = reactive({})
  let dates = reactive({})
  const fetching = ref(false)
  const routeOnwer = ref(false)

  // const isMobile = computed(() => {
  //   return screen.width <= 760
  // })

  getRide(route.params.id)

  async function getRide(id) {
    fetching.value = true

    ride = await ridesStore.getRide(id)
    dates = await ridesStore.getRideDates(id)

    fetching.value = false
    pageTitle.value = ride.name

    routeOnwer.value = getRouteOwner()
  }

  const formatDate = date => {
    let fDate = ''
    if (!date) {
      fDate = '???'
    } else {
      const dateYear = date.substr(0, 4)
      const dateMonth = date.substr(5, 2)
      const dateDay = date.substr(8, 2)
      fDate = dateDay + '/' + dateMonth + '/' + dateYear
    }
    return fDate
  }

  const getRouteOwner = () => {
    if (authStore.user.admin) {
      return true
    } else {
      return ride.owner === authStore.user.id
    }
  }

  function editUser() {
    router.push({ name: 'editRide', params: { id: ride.id } })
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto p-4">
    <div class="user-view-grid">
      <span
        v-if="fetching"
        class="text-cs-h4 text-color-std-high-tint"
        >Esperando datos...</span
      >
      <span
        v-else="fetching"
        class="text-cs-h4 text-color-std-high-tint"
      ></span>
      <div class="justify-self-end flex gap-5">
        <button
          class="btn btn-std btn-cancel"
          @click="router.push({ name: 'rides' })"
        >
          Volver
        </button>
        <button
          v-if="routeOnwer"
          class="btn btn-std btn-submit"
          @click="editUser"
        >
          Editar
        </button>
      </div>
    </div>
    <div
      v-if="!fetching"
      class="user-view-grid mt-6"
    >
      <span class="text-cs-h3">Nombre:</span>
      <span class="text-cs-h3">{{ ride.name }}</span>
      <span class="text-cs-h3">Fechas:</span>
      <div>
        <!-- <div
          v-for="(date, index) in ride.dates.sort((a, b) => (a.date > b.date ? 1 : -1))"
          :key="index"
          class="flex gap-x-6"
        > -->
        <div
          v-for="date in dates"
          class="flex gap-x-6"
        >
          <span class="text-cs-h3">{{ formatDate(date.date) }}</span>
          <span class="text-cs-h3">{{ date.days }} {{ date.days == 1 ? 'dia' : 'dias' }}</span>
        </div>
      </div>
      <span class="text-cs-h3">Notas:</span>
      <span class="text-cs-h3 pre-line">{{ ride.note }}</span>
    </div>
  </div>
</template>

<style scoped>
  .user-view-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: max-content 1fr;
  }
  .pre-line {
    white-space: pre-line;
  }
</style>
