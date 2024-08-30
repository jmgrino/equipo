<script setup>
  import { reactive, ref, nextTick } from 'vue'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useAuthStore } from '@/stores/authStore'
  import { useRouter, useRoute } from 'vue-router'
  import IconDelete from '@/components/icons/IconDelete.vue'

  // import { getValidationMessages } from '@formkit/validation'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const pageTitle = ref('')
  let ride = reactive({})
  let dates = reactive({})
  const createdBy = ref({})

  const fetching = ref(false)
  const routeOnwer = ref(false)
  const renderDates = ref(true)
  const showFormkit = ref(false)
  const errorMessage = ref('')
  let timeoutID

  const formData = reactive({
    date: '',
    days: 1,
  })

  // const isMobile = computed(() => {
  //   return screen.width <= 760
  // })

  getRide(route.params.id)

  async function getRide(id) {
    fetching.value = true

    ride = await ridesStore.getRide(id)
    dates = await ridesStore.getRideDates(id)
    createdBy.value = await authStore.getUser(ride.owner)

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

  function showDateFields(value) {
    showFormkit.value = value
  }

  async function addDate() {
    const date = {
      date: formData.date,
      days: formData.days,
      ride: ride.id,
      owner: authStore.user.id,
    }
    const dateId = await ridesStore.addDate(date)
    date.id = dateId
    showDateFields(false)
    dates.push(date)
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
      }, 500000)
    }

    forceRender()
  }

  async function confirmDeleteDate(index) {
    clearTimeout(timeoutID)
    await ridesStore.deleteDate(dates[index].id)
    dates.splice(index, 1)

    forceRender()
  }

  const forceRender = async () => {
    renderDates.value = false
    await nextTick()
    renderDates.value = true
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
        class="text-cs-h4 text-color-std"
        >Ruta creada por {{ createdBy.name }}</span
      >
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
      <div class="dates-grid cs-form">
        <template v-if="renderDates">
          <template
            v-for="(date, index) in dates"
            :key="index"
          >
            <span class="text-cs-h3">{{ formatDate(date.date) }}</span>
            <span class="text-cs-h3">{{ date.days }} {{ date.days == 1 ? 'dia' : 'dias' }}</span>

            <div v-if="date.message">
              <p class="text-cs-std">No se puede borrar porque hay ciclistas apuntados</p>
            </div>
            <div v-else-if="date.confirm">
              <button
                class="btn btn-std btn-submit"
                @click="confirmDeleteDate(index)"
              >
                Confirmar borrado
              </button>
            </div>
            <div v-else>
              <IconDelete
                v-if="date.owner === authStore.user.id"
                class="icon-delete"
                size="3.2rem"
                title="Borrar fecha"
                @click="deleteDate(index)"
                :stroke="date.users ? 'rgba(90,118,135,0.5)' : 'currentcolor'"
              >
              </IconDelete>
            </div>
          </template>
        </template>

        <FormKit
          type="form"
          form-class="col-start-1 col-end-4 add-date-grid cs-form"
          :actions="false"
          @submit="addDate"
          validation-visibility="submit"
          :incomplete-message="false"
          :value="formData"
        >
          <div
            v-if="showFormkit"
            class="flex items-center"
          >
            <FormKit
              label="Fecha"
              outer-class=""
              type="date"
              :name="'date'"
              placeholder="Fecha"
              v-model.trim="formData.date"
            />
          </div>
          <FormKit
            v-if="showFormkit"
            label="Dias"
            input-class="w-[5rem]"
            type="number"
            :name="'days'"
            placeholder=""
            validation="required"
            min="1"
            :validation-messages="{ required: 'La duración es obligatoria' }"
            v-model.trim="formData.days"
          />
          <FormKit
            v-if="showFormkit"
            type="button"
            label="Cancelar"
            outer-class="cancel-button"
            wrapper-class="mt-6"
            @click.prevent="showDateFields(false)"
          />

          <FormKit
            v-if="showFormkit"
            type="submit"
            label="Añadir"
            outer-class="submit-button"
            wrapper-class="mt-6"
          />
        </FormKit>

        <div
          v-if="!showFormkit"
          class="col-start-1 col-end-4"
        >
          <button
            class="btn btn-std btn-submit mb-4"
            @click.prevent="showDateFields(true)"
          >
            Añadir fecha
          </button>
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
  .dates-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: max-content max-content 1fr;
  }
  .add-date-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    align-items: center;
    grid-template-columns: max-content max-content max-content max-content;
  }
  .icon-delete {
    cursor: pointer;
  }
  .pre-line {
    white-space: pre-line;
  }
</style>
