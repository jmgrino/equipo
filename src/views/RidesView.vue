<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/authStore'
  import { useRidesStore } from '@/stores/ridesStore'
  import RideItem from '@/components/RideItem.vue'
  import { useMinButton } from '@/composables/utilities/useMinButton'

  const router = useRouter()

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()

  const topRef = ref(null)
  const render = ref(false)
  const currentUser = ref('')
  const currentShortname = ref('')
  const userIncluded = ref(false)

  let usersList = ref({})
  let datesList = ref({})

  ridesStore.validData().then(() => {
    usersList = computed(() => {
      return ridesStore.deepCopy(ridesStore.users)
    })

    datesList = computed(() => {
      const dates = ridesStore.deepCopy(ridesStore.dates)

      currentUser.value = authStore.user.id
      currentShortname.value = authStore.user.shortName

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
              color: usersList.value[index].color,
            })
          })
          date.shortNames.sort((a, b) => (a.name === b.name ? 0 : a.name < b.name ? -1 : 1))
        }
      })
      console.log(dates)
      return dates
    })

    render.value = true
  })

  const { minButton } = useMinButton(topRef, 20)

  function addRide() {
    router.push({ name: 'newRide' })
  }

  function viewRide(id) {
    router.push({ name: 'ride', params: { id } })
  }

  function editRide(id) {
    router.push({ name: 'editRide', params: { id } })
  }

  function addShortname(index, date) {
    ridesStore.addDateUser(date.id, currentUser.value)
  }

  function removeShortname(index, date) {
    ridesStore.removeDateUser(date.id, currentUser.value)
  }
</script>

<template>
  <div class="sm:container mx-auto px-3">
    <div class="fixed-on-top">
      <button
        class="btn btn-submit btn-std"
        :class="minButton ? 'btn-plus' : 'btn-add'"
        @click="addRide"
      ></button>
    </div>

    <h1
      class="cs-h1"
      ref="topRef"
    >
      Rutas
    </h1>

    <div v-if="render">
      <RideItem
        v-for="ride in ridesStore.rides"
        :ride="ride"
        :dates="datesList.filter(date => date.ride === ride.id)"
        :currentShortname="currentShortname"
        @view-ride-event="viewRide"
        @edit-ride-event="editRide"
        @add-shortname="addShortname"
        @remove-shortname="removeShortname"
      />
    </div>
  </div>
</template>

<style scoped>
  .fixed-on-top {
    position: fixed;
    top: 8.4rem;
    right: 4.8rem;
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

  /* .btn.btn-min {
    font-size: 3.4rem;
    padding: 0 12px 6px 12px;
    line-height: 1;
  } */
</style>
