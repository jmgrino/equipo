<script setup>
  import { reactive, ref, nextTick, onMounted, onUpdated, computed } from 'vue'
  import { useAuthStore } from '@/stores/authStore'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useRouter, useRoute } from 'vue-router'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import IconDownload from '@/components/icons/IconDownload.vue'
  import { useModal } from '@/composables/utilities/useModal'
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'
  import { auth } from '@/db/firebase/firebase'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const modal = useModal()

  let ride = reactive({})
  let dates = reactive({})
  let tracks = reactive({})
  let photos = ref([])

  const createdBy = ref({})
  const fetching = ref(false)
  const routeOnwer = ref(false)
  const renderDates = ref(true)
  const showForm = ref(false)
  ride
  const localShortDate = ref(false)
  const isMobile = ref(false)
  const datesRef = ref(null)
  let timeoutID

  const modalRide = ref({})
  const modalButtons = ref([])
  const modalParagraph = ref('')

  const formData = reactive({
    date: '',
    days: 1,
    noDay: false,
  })

  onMounted(() => {
    isMobile.value = screen.width <= 480
  })

  onUpdated(() => {
    if (datesRef.value) {
      if (isMobile.value) {
        localShortDate.value = authStore.user.shortDate
      } else {
        localShortDate.value = false
      }
      datesRef.value.forEach(dateRef => {
        const datesDiv = dateRef
        const newWidth = authStore.user.dateWidth + 10
        if (isMobile.value && authStore.user.dateWidth > 0) {
          datesDiv.style = `grid-template-columns: minmax(${newWidth}rem, max-content) 1fr`
        } else {
          datesDiv.style = `grid-template-columns: minmax(20rem, max-content) 1fr`
        }
      })
    }
  })

  getRide(route.params.id)

  async function getRide(id) {
    fetching.value = true

    ride = await ridesStore.getRide(id)
    dates = await ridesStore.getRideDates(id)
    tracks = ridesStore.tracks.filter(track => track.ride === ride.id)

    for (let date of dates) {
      const userNames = []
      if (date.users) {
        for (let user of date.users) {
          // find user in ridesStore.users
          const userName = ridesStore.users.find(u => u.id === user)?.name
          if (userName) {
            userNames.push(userName)
          }
        }
        // sort userNames alphabetically
        userNames.sort((a, b) => a.localeCompare(b))
        date = Object.assign(date, { userNames: userNames.slice() })
      }
    }

    await ridesStore.checkValidPhotos()

    const allPhotos = computed(() => {
      return ridesStore.deepCopy(ridesStore.photos)
    })

    photos.value = allPhotos.value.filter(photo => photo.ride === ride.id)

    createdBy.value = await authStore.getUser(ride.owner)

    fetching.value = false

    routeOnwer.value = getRouteOwner()
  }

  const fDate = (date, noDay) => {
    let fDate = ''
    if (date === '') {
      if (localShortDate.value) {
        fDate = '???' + String.fromCharCode(160).repeat(2)
      } else {
        fDate = '???' + String.fromCharCode(160).repeat(5)
      }
    } else {
      const dateYear = date.substr(2, 2)
      const dateMonth = date.substr(5, 2)
      const dateDay = noDay ? '??' : date.substr(8, 2)
      if (localShortDate.value) {
        fDate = dateDay + '/' + dateMonth
      } else {
        fDate = dateDay + '/' + dateMonth + '/' + dateYear
      }
    }
    return fDate
  }

  const fDay = (date, noDay) => {
    const weekday = ['D', 'L', 'M', 'W', 'J', 'V', 'S']

    let fDay = ''
    if (date === '') {
      fDay = '?'
    } else if (noDay) {
      fDay = '?'
    } else {
      const d = new Date(date)
      fDay = weekday[d.getDay()]
    }
    return fDay
  }

  const getRouteOwner = () => {
    if (authStore.user.admin) {
      return true
    } else {
      return ride.owner === authStore.user.id
    }
  }

  function editRide() {
    router.push({ name: 'editRide', params: { id: ride.id } })
  }

  async function duplicateRide() {
    modalRide.value.id = route.params.id
    modalRide.value.name = ride.name

    modalParagraph.value = '¿Seguro que quieres duplicar esta ruta?'
    modalButtons.value = [
      { label: 'Cancelar', type: 'cancel' },
      { label: 'Duplicar', type: 'submit' },
    ]

    modal.showModal(ModalOverlay)
    const result = await modal.waitAnswer()

    if (result) {
      ridesStore.duplicateRide(route.params.id, authStore.user.id)
      router.push({ name: 'rides' })
    }
  }

  function showDateFields(value) {
    showForm.value = value
  }

  async function addDate() {
    const date = {
      date: formData.date,
      days: formData.days,
      ride: ride.id,
      owner: authStore.user.id,
      noDay: formData.noDay,
    }
    const dateId = await ridesStore.addDate(date)
    date.id = dateId
    showDateFields(false)
    dates.push(date)
    ridesStore.sortDates(dates)

    const datesWithValidDate = dates.filter(date => date.date !== '' && !date.canceled)

    if (datesWithValidDate.length > 0) {
      ride.date = datesWithValidDate[0].date
      ride.lastDate = datesWithValidDate.reverse()[0].date
    } else {
      ride.date = ''
      ride.lastDate = ''
    }

    ridesStore.updateRide(ride)

    formData.date = ''
    formData.days = 1
    formData.noDay = false

    forceRender()
  }

  function deleteDate(index) {
    let numUsers = 0
    if (dates[index].users) {
      numUsers = dates[index].users.length
    }

    if (numUsers > 0) {
      dates[index].message = true
      // dates[index].confirm = false
    } else {
      // dates[index].message = false
      dates[index].confirm = true
      timeoutID = setTimeout(() => {
        dates[index].confirm = false
        forceRender()
      }, 3000)
    }

    forceRender()
  }

  async function confirmDeleteDate(index) {
    clearTimeout(timeoutID)
    await ridesStore.deleteDate(dates[index].id)
    dates.splice(index, 1)
    ridesStore.sortDates(dates)

    const datesWithValidDate = dates.filter(date => date.date !== '' && !date.canceled)

    if (datesWithValidDate.length > 0) {
      ride.date = datesWithValidDate[0].date
      ride.lastDate = datesWithValidDate.reverse()[0].date
    } else {
      ride.date = ''
      ride.lastDate = ''
    }

    ridesStore.updateRide(ride)

    forceRender()
  }

  const forceRender = async () => {
    renderDates.value = false
    await nextTick()
    renderDates.value = true
  }

  function capitalize(s) {
    return String(s[0]).toUpperCase() + String(s).slice(1)
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function mensualChanged(checked) {
    let month
    let year
    let newDate

    if (checked) {
      if (formData.date) {
        month = +formData.date.substring(5, 7)
        year = +formData.date.substring(0, 4)
        newDate = new Date(year, month, 1)
      } else {
        const today = new Date()
        month = today.getMonth() + 1
        year = today.getFullYear()
        newDate = new Date(year, month, 1)
      }

      newDate.setDate(newDate.getDate() - 1)

      let strMonth = newDate.getMonth() + 1
      strMonth = month.toString().padStart(2, '0')
      let strYear = newDate.getFullYear()
      let strDay = newDate.getDate().toString()

      formData.date = strYear + '-' + strMonth + '-' + strDay

      // forceRender()
    }
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto p-4 sm:max-w-full sm:shadow-none">
    <div class="header-grid">
      <span
        v-if="fetching"
        class="text-cs-h4 leading-cs-h4 text-color-std-high-tint sm:row-start-2"
        >Esperando datos...</span
      >
      <span
        v-else
        class="text-cs-h4 leading-cs-h4 text-color-std sm:row-start-2"
        >Ruta creada por {{ createdBy.name }}</span
      >
      <div class="justify-self-end flex gap-5 sm:row-start-1">
        <CancelButton
          label="Volver"
          @onClick="router.push({ name: 'rides' })"
        />
        <AcceptButton
          label="Duplicar"
          @onClick="duplicateRide"
        />
        <AcceptButton
          v-if="routeOnwer"
          label="Editar"
          @onClick="editRide"
        />
      </div>
    </div>
    <div
      v-if="!fetching"
      class="user-view-grid mt-6"
    >
      <span class="label text-cs-h3 leading-cs-h3">Nombre:</span>
      <span class="text-cs-h3 leading-cs-h3 sm:font-bold">{{ ride.name }}</span>
      <span class="label text-cs-h3 leading-cs-h3">Tipo:</span>
      <span class="text-cs-h3 leading-cs-h3"
        ><span class="hidden sm:inline">- </span>{{ ride.type }} {{ ride.distance ? `${ride.distance} km` : '' }}
        {{ ride.elevation ? `+${ride.elevation} m` : '' }}</span
      >
      <span class="text-cs-h3 leading-cs-h3 sm:underline sm:underline-offset-2">Fechas:</span>
      <div class="dates-grid-layout text-20px leading-20px">
        <template v-if="renderDates">
          <div
            v-for="(date, index) in dates"
            class="dates-grid"
            :key="date?.date"
            ref="datesRef"
          >
            <p
              class="pt-1"
              :class="{ canceled: date.canceled === true }"
            >
              {{ fDay(date.date, date.noDay) }} {{ fDate(date.date, date.noDay) }} {{ date.days }}&nbsp;{{
                date.days == 1 ? 'dia&nbsp;' : 'dias'
              }}&nbsp;
            </p>

            <div
              v-if="date.message"
              class="sm:col-start-1 sm:col-span-3"
            >
              <p class="text-cs-std leading-cs-std">No se puede borrar porque hay ciclistas apuntados</p>
            </div>
            <div
              v-else-if="date.confirm"
              class="sm:col-start-1 sm:col-span-3"
            >
              <button
                class="btn btn-std btn-submit"
                @click="confirmDeleteDate(index)"
              >
                Confirmar borrado
              </button>
            </div>
            <div
              v-else
              class="mb-1"
            >
              <IconDelete
                v-if="date.owner === authStore.user.id"
                class="icon"
                size="3.2rem"
                title="Borrar fecha"
                @click="deleteDate(index)"
                :stroke="date.users?.length ? 'rgba(90,118,135,0.5)' : 'currentcolor'"
              >
              </IconDelete>
            </div>
            <div
              v-if="date.userNames"
              class="font-sans text-cs-std leading-cs-std -mt-2 col-span-full"
            >
              <span>({{ date.userNames.join(', ') }})</span>
            </div>
          </div>
        </template>

        <form
          v-if="showForm"
          @submit.prevent="addDate"
          class="add-date-grid"
        >
          <BaseInputDate
            label="Fecha"
            elem-id="date"
            v-model="formData.date"
          />
          <BaseInput
            label="Dias"
            type="number"
            elem-id="days"
            width="50px"
            v-model="formData.days"
          />
          <BaseCheckbox
            label="Mensual"
            elem-id="noDay"
            v-model="formData.noDay"
            @inputChanged="mensualChanged"
          />
          <div class="col-start-1 col-end-4 justify-self-end mt-8">
            <CancelButton
              label="Cancelar"
              @onClick="showDateFields(false)"
              class="mr-4"
            />
            <AcceptButton
              label="Añadir"
              type="submit"
            />
          </div>
        </form>

        <div v-if="!showForm">
          <button
            class="btn btn-std btn-submit mb-4"
            @click.prevent="showDateFields(true)"
          >
            Añadir fecha
          </button>
        </div>
      </div>
      <span
        v-if="ride.note"
        class="text-cs-h3 leading-cs-h3"
        >Notas:</span
      >
      <span
        v-if="ride.note"
        class="text-cs-h3 leading-cs-h3 notes"
        >{{ ride.note }}</span
      >
      <template v-if="tracks.length > 0">
        <span class="text-cs-h3 leading-cs-h3 mt-4 sm:underline sm:underline-offset-2">Tracks:</span>
        <!-- <p class="text-cs-h1 leading-cs-h1 text-red-600">Modificar tracks grid</p> -->
        <div class="col-start-2 sm:col-start-1 mt-4 sm:mt-0">
          <div
            v-for="track in tracks"
            class="track-flex"
          >
            <span class="text-cs-h3 leading-cs-h3 self-start hidden sm:block">-</span>
            <span class="text-cs-h3 leading-cs-h3">{{ track.name }}</span>
            <a
              :href="track.url"
              class="self-end pb-2"
            >
              <IconDownload
                class="icon"
                size="3.2rem"
                title="Descargar track"
              >
              </IconDownload>
            </a>
          </div>
        </div>
      </template>
    </div>

    <div class="mt-16 mb-8">
      <div
        v-for="photo in photos"
        class="mt-8"
      >
        <p class="leading-cs-h3">{{ photo.name }}</p>
        <img
          :src="photo.url"
          :alt="photo.name"
          class="w-full"
        />
      </div>
    </div>
  </div>
  <component
    v-if="modal.show.value"
    :is="modal.component.value"
    :header="modalRide.name"
    :paragraph="modalParagraph"
    :buttons="modalButtons"
    @close="modal.hideModal"
  />
</template>

<style scoped>
  .user-view-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: minmax(min-content, max-content) 1fr;
  }
  .header-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content;
  }
  .dates-grid-layout {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 8px;
  }
  .dates-grid {
    display: grid;
    column-gap: 16px;
    font-family: cousine, monospace;
    grid-template-columns: minmax(20rem, max-content) 1fr;
    grid-template-rows: min-content min-content;
  }
  .add-date-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    align-items: center;
    justify-items: start;
    grid-template-columns: max-content max-content max-content 1fr;
  }

  .track-flex {
    display: flex;
    column-gap: 8px;
    align-items: center;
    overflow-wrap: anywhere;
    border-bottom: 1px dotted #9ca3af;
  }
  .icon {
    cursor: pointer;
  }
  .icon:hover {
    color: var(--color-std-high);
  }
  .notes {
    white-space: pre-line;
    border: 1px solid #d1d5db;
    padding: 8px;
  }
  .canceled {
    text-decoration: line-through;
  }

  @media (max-width: 480px) {
    .label {
      display: none;
    }
    .user-view-grid {
      grid-template-columns: 1fr;
    }
    .header-grid {
      grid-template-columns: 1fr;
      grid-template-rows: min-content min-content;
    }
  }
</style>
