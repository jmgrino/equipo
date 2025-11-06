<script setup>
  import { ref, computed, onMounted, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useRidesStore } from '@/stores/ridesStore'
  import RideItem from '@/components/RideItem.vue'
  import { useMinButton } from '@/composables/utilities/useMinButton'
  import { useFormatDate } from '@/composables/utilities/useFormatDate'
  import IconPlus from '@/components/icons/IconPlus.vue'
  import IconMinus from '@/components/icons/IconMinus.vue'

  const INITIAL_DATE_WIDTH = 10
  const MIN_DATE_WIDTH = 9
  const MAX_DATE_WIDTH = 24

  const router = useRouter()

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()

  const topRef = ref(null)
  const render = ref(false)
  const currentUser = ref('')
  const currentShortname = ref('')
  const userAdmin = ref(false)
  const userIncluded = ref(false)
  const filterText = ref('Pendientes')
  const rideFilter = ref('pending')
  const dateWidth = ref(INITIAL_DATE_WIDTH)
  const shortDate = ref(false)

  let usersList = ref([])
  let datesList = ref([])
  let filteredRides = ref([])

  const { minButton } = useMinButton(topRef, 20)
  const { formatMonth } = useFormatDate()

  onMounted(() => {
    rideFilter.value = localStorage.getItem('rideFilter') || ''
  })

  watch(rideFilter, newVal => {
    localStorage.setItem('rideFilter', newVal)
  })

  const today = computed(() => {
    const currentdate = new Date()
    return (
      currentdate.getFullYear() +
      '-' +
      ('0' + (currentdate.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + currentdate.getDate()).slice(-2)
    )
  })

  ridesStore.validData().then(() => {
    currentUser.value = authStore.user.id
    currentShortname.value = authStore.user.shortName
    if (authStore.user.dateWidth) dateWidth.value = authStore.user.dateWidth
    if (authStore.user.shortDate) shortDate.value = authStore.user.shortDate
    if (authStore.user.admin) {
      userAdmin.value = true
    } else {
      userAdmin.value = false
    }

    usersList = computed(() => {
      return ridesStore.deepCopy(ridesStore.users)
    })

    filteredRides = computed(() => {
      let filteredRides

      const ridesCopy = ridesStore.deepCopy(ridesStore.rides)
      switch (rideFilter.value) {
        case 'pending':
          filterText.value = 'Pendientes'
          filteredRides = ridesCopy.filter(ride => ride.lastDate >= today.value || ride.lastDate === '')
          break
        case 'old':
          filterText.value = 'Antiguas'
          filteredRides = ridesCopy.filter(ride => ride.lastDate < today.value && ride.lastDate !== '').reverse()
          break
        default:
          filterText.value = 'Pendientes'
          filteredRides = ridesCopy.filter(ride => ride.lastDate >= today.value || ride.lastDate === '')
          break
      }

      let oldMonthName = ''
      filteredRides.forEach(ride => {
        let monthName = formatMonth(ride.date)
        if (monthName === oldMonthName) {
          Object.assign(ride, { monthName: '' })
        } else {
          Object.assign(ride, { monthName: monthName })
        }

        oldMonthName = monthName
      })

      return filteredRides
    })

    datesList = computed(() => {
      const dates = ridesStore.deepCopy(ridesStore.dates)

      dates.forEach(date => {
        userIncluded.value = false
        if (date.users && date.users.length > 0) {
          Object.assign(date, { shortNames: [] })
          date.users.forEach(dateUser => {
            if (dateUser === currentUser.value) {
              Object.assign(date, { userIncluded: true })
            }

            const index = usersList.value.findIndex(user => user.id === dateUser)
            date.shortNames.push({
              id: dateUser,
              name: usersList.value[index].shortName,
              fullName: usersList.value[index].name,
              color: usersList.value[index].color,
            })
          })
          date.shortNames.sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
        }
      })
      return dates
    })

    render.value = true
  })

  function filterDates(rideId) {
    return ridesStore.deepCopy(datesList.value.filter(date => date.ride === rideId))
    // datesList.filter(date => date.ride === ride.id)
  }

  function addRide() {
    router.push({ name: 'newRide' })
  }

  function viewRide(id) {
    router.push({ name: 'ride', params: { id } })
  }

  function editRide(id) {
    router.push({ name: 'editRide', params: { id } })
  }

  function addShortname(date, user) {
    const userId = user ? user.id : currentUser.value

    ridesStore.addDateUser(date.id, userId)
  }

  function removeShortname(date, user) {
    const userId = user ? user.id : currentUser.value

    ridesStore.removeDateUser(date.id, userId)
  }

  function filterButtonClick() {
    if (rideFilter.value === 'pending') {
      rideFilter.value = 'old'
    } else {
      rideFilter.value = 'pending'
    }
  }

  function addSpace() {
    if (dateWidth.value < MAX_DATE_WIDTH) dateWidth.value = dateWidth.value + 1
  }

  function removeSpace() {
    if (dateWidth.value > MIN_DATE_WIDTH) dateWidth.value = dateWidth.value - 1
  }

  async function applyFormat() {
    const userData = {
      dateWidth: dateWidth.value,
      shortDate: shortDate.value,
    }
    await authStore.updateUser(currentUser.value, userData)

    authStore.showModSpace = false
  }

  function cancelFormat() {
    authStore.showModSpace = false
    if (authStore.user.dateWidth) {
      dateWidth.value = authStore.user.dateWidth
    } else {
      dateWidth.value = INITIAL_DATE_WIDTH
    }
    if (authStore.user.shortDate) {
      shortDate.value = authStore.user.shortDate
    } else {
      shortDate.value = false
    }
  }
</script>

<template>
  <div class="container mx-auto">
    <div class="fixed-on-top">
      <button
        class="btn btn-submit btn-std"
        :class="minButton ? 'btn-plus' : 'btn-add'"
        @click="addRide"
      ></button>
    </div>

    <div class="flex gap-4 items-center">
      <h1
        class="cs-h1"
        ref="topRef"
      >
        Rutas
      </h1>
      <button
        class="btn btn-selector btn-min"
        @click="filterButtonClick"
      >
        {{ filterText }}
      </button>
    </div>

    <div
      v-if="authStore.showModSpace"
      class="flex items-center gap-x-2"
    >
      <IconMinus
        class="icon"
        size="4.0rem"
        title="Desapuntarme de la ruta"
        @click="removeSpace"
      />
      <div class="text-cs-h2 leading-cs-h2">{{ dateWidth }}</div>
      <IconPlus
        class="icon"
        size="4.0rem"
        title="Apuntarme a la ruta"
        @click="addSpace"
      />
      <input
        type="checkbox"
        class="ml-4"
        v-model="shortDate"
      /><span class="text-cs-h4 leading-cs-h4">Formato de fecha reducido</span>
    </div>
    <div
      v-if="authStore.showModSpace"
      class="flex items-center gap-x-2 my-4 justify-end"
    >
      <button
        class="btn btn-cancel btn-min px-2 ml-4"
        @click="cancelFormat"
      >
        Cancelar
      </button>
      <button
        class="btn btn-submit btn-min px-2 ml-4"
        @click="applyFormat"
      >
        Guardar formato
      </button>
    </div>

    <div v-if="render">
      <div v-for="(ride, index) in filteredRides">
        <h3
          v-if="index === 0"
          class="text-cs-h3 leading-cs-h3 text-blue-500 border-b-2 border-color-std"
        >
          {{ ride.monthName }}
        </h3>
        <h3
          v-if="index > 0 && ride.monthName"
          class="text-cs-h3 leading-cs-h3 text-blue-500 border-b-2 border-color-std pt-4"
        >
          {{ ride.monthName }}
        </h3>
        <RideItem
          :ride="ride"
          :dates="filterDates(ride.id)"
          :currentShortname="currentShortname"
          :userAdmin="userAdmin"
          :usersList="usersList"
          :dateWidth="dateWidth"
          :shortDate="shortDate"
          @view-ride-event="viewRide"
          @edit-ride-event="editRide"
          @add-shortname="addShortname"
          @remove-shortname="removeShortname"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fixed-on-top {
    position: fixed;
    top: 8.4rem;
    right: 4.8rem;
    z-index: 1;
  }

  .btn-add::after {
    content: 'Añadir';
  }

  .btn-plus {
    padding-left: 16px;
    padding-right: 16px;
    min-width: initial;
  }

  .btn-plus::after {
    content: '+';
    height: 100%;
    font-size: 2.4rem;
    line-height: 1;
  }

  .icon {
    cursor: pointer;
    display: inline-block;
  }

  .icon:hover {
    color: var(--color-std-high);
  }

  @media (max-width: 640px) {
    .fixed-on-top {
      right: 0.8rem;
    }
  }
</style>
