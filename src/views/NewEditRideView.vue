<script setup>
  import { reactive, ref, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useAuthStore } from '@/stores/authStore'
  // import { getValidationMessages } from '@formkit/validation'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  const initialValues = {
    name: '',
    type: 'carretera',
    note: '',
    owner: '',
    dates: [],
  }

  const rideType = ['Carretera', 'BTT', 'Gravel']

  let formData = reactive({})

  const submitLabel = ref('')
  const pageTitle = ref('')
  const renderDates = ref(true)

  const isDisabled = ref(false)
  const errorMessage = ref('')
  // errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  const isNew = ref(false)
  let timeoutID

  const isModalOpen = ref(false)
  const modalRide = ref({})
  const modalButtons = ref([
    {
      type: 'cancel',
      label: 'Cancelar',
    },
    {
      type: 'submit',
      label: 'Borrar',
    },
  ])

  if (route.params.id) {
    isNew.value = false
    getRide(route.params.id)
    submitLabel.value = 'Actualizar'
  } else {
    isNew.value = true
    pageTitle.value = 'Nueva ruta'
    submitLabel.value = 'Añadir'
    Object.assign(formData, { ...initialValues })
  }

  async function getRide(id) {
    const ride = await ridesStore.getRide(id)
    const dates = await ridesStore.getRideDates(id)

    formData = ridesStore.deepCopy(ride)
    const datesData = ridesStore.deepCopy(dates)

    Object.assign(formData, { dates: datesData })
    pageTitle.value = ride.name
  }

  async function submitHandler() {
    isDisabled.value = true
    errorMessage.value = ''

    // await wait(2000)
    formData.dates.forEach(date => {
      delete date.message
      delete date.confirm
    })

    const { dates: modDates, ...modRide } = formData

    modRide.date = ''
    if (modDates) {
      if (modDates.length > 0) {
        ridesStore.sortDates(modDates)
        modRide.date = modDates[0].date
      }
    }

    if (isNew.value) {
      modRide.owner = authStore.user.id
      const rideId = await ridesStore.addRide(modRide)
      ridesStore.addRideDates(rideId, modDates)
    } else {
      ridesStore.updateRide(modRide)
      ridesStore.updateRideDates(modRide.id, modDates)
    }

    isDisabled.value = false
    if (isNew.value) {
      router.push({ name: 'rides' })
    } else {
      router.push({ name: 'rides' })
    }
  }

  function showErrors(node) {
    // const validations = getValidationMessages(node)
    errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  }

  function cancelHandler() {
    router.back()
  }

  function deleteRide() {
    modalRide.value = formData
    modalRide.value.id = route.params.id
    isModalOpen.value = true
  }

  function addDate() {
    formData.dates.push({
      date: '',
      days: 1,
      id: 'new',
      ride: formData.id,
      owner: authStore.user.id,
    })
    forceRender()
  }

  function deleteDate(index) {
    let numUsers = 0
    if (formData.dates[index].users) {
      numUsers = formData.dates[index].users.length
    }

    if (numUsers > 0) {
      formData.dates[index].message = true
      // formData.dates[index].confirm = false
    } else {
      // formData.dates[index].message = false
      formData.dates[index].confirm = true
      timeoutID = setTimeout(() => {
        formData.dates[index].confirm = false
        forceRender()
      }, 3000)
    }

    forceRender()
  }

  function confirmDeleteDate(index) {
    clearTimeout(timeoutID)
    formData.dates.splice(index, 1)
    forceRender()
  }

  function dialogResult(result) {
    isModalOpen.value = false
    if (result) {
      ridesStore.deleteRide(modalRide.value.id)
      router.push({ name: 'rides' })
    }
  }

  const forceRender = async () => {
    renderDates.value = false
    await nextTick()
    renderDates.value = true
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto md:max-w-full md:shadow-none">
    <div class="flex justify-between items-center pt-5 gap-x-4">
      <h1 class="text-4xl font-black ml-10">{{ pageTitle }}</h1>
    </div>
    <FormKit
      type="form"
      form-class="cs-form mt-10 p-10 w-full md:p-5"
      :actions="false"
      @submit="submitHandler"
      @submit-invalid="showErrors"
      validation-visibility="submit"
      :incomplete-message="false"
      :value="formData"
    >
      <div class="user-view-grid">
        <FormKit
          label="Nombre"
          outer-class="col-start-1 col-end-4 w-full"
          type="text"
          name="name"
          placeholder="Nombre de la ruta"
          validation="required"
          :validation-messages="{ required: 'El Nombre de la ruta es obligatorio' }"
          v-model.trim="formData.name"
        />

        <FormKit
          label="Tipo de ruta"
          outer-class="col-start-1 col-end-4 w-[16.5rem]"
          type="select"
          name="type"
          :options="rideType"
          v-model.trim="formData.type"
        />

        <template v-if="renderDates">
          <template
            v-for="(date, index) in formData.dates"
            :key="index"
          >
            <div class="flex items-center col-start-1">
              <FormKit
                label="Fecha"
                input-class="min-w-[15rem]"
                type="date"
                :name="'date' + index"
                placeholder="Fecha"
                v-model.trim="formData.dates[index].date"
              />
            </div>

            <FormKit
              label="Dias"
              input-class="w-[5rem]"
              type="number"
              :name="'days' + index"
              placeholder="Dias de duracion la ruta"
              validation="required"
              min="1"
              :validation-messages="{ required: 'La duración es obligatoria' }"
              v-model.trim="formData.dates[index].days"
            />

            <div
              v-if="date.message"
              class="sm:col-start-1 sm:col-span-3"
            >
              <p class="text-cs-std mt-5 sm:mt-0">No se puede borrar porque hay ciclistas apuntados</p>
            </div>
            <div
              v-else-if="date.confirm"
              class="sm:col-start-1 sm:col-span-3"
            >
              <button
                class="btn btn-std btn-submit mt-6 sm:mt-0"
                @click="confirmDeleteDate(index)"
              >
                Confirmar borrado
              </button>
            </div>
            <div v-else>
              <IconDelete
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
        <div class="col-start-1 col-end-4">
          <button
            class="btn btn-std btn-submit mb-4"
            @click.prevent="addDate"
          >
            Añadir fecha
          </button>
        </div>

        <FormKit
          label="Notas"
          outer-class="col-span-3"
          type="textarea"
          name="note"
          placeholder="Notas"
          validation="length:0,512"
          :validation-messages="{ length: 'Las notas no pueden tener mas de 512 caracteres' }"
          rows="6"
          v-model.trim="formData.note"
        />
      </div>

      <!-- 
      validation="required"
      :validation-messages="{ required: 'La fecha es obligatoria' }" 
      -->

      <div class="pt-8 buttons-grid">
        <div
          class="sm:justify-self-center justify-self-end row-start-1 col-start-2 sm:col-start-1 sm:col-span-2 flex flex-wrap items-center content-center justify-end gap-x-4"
        >
          <FormKit
            type="button"
            label="Cancelar"
            outer-class="cancel-button"
            @click="cancelHandler"
            :disabled="isDisabled"
          />

          <FormKit
            type="submit"
            :label="submitLabel"
            outer-class="submit-button"
            :disabled="isDisabled"
          />
        </div>

        <span class="col-span-2 p-2 text-[red] text-xl sm:justify-self-center justify-self-end">{{ errorMessage }}</span>

        <button
          v-show="!isNew"
          class="btn btn-std btn-submit justify-self-center row-start-1 col-start-1 sm:row-start-2"
          @click.prevent="deleteRide"
        >
          Borrar ruta
        </button>
      </div>
    </FormKit>
  </div>
  <ModalOverlay
    :open-dialog.sync="isModalOpen"
    :header="modalRide.name"
    paragraph="¿Seguro que quieres borrar esta ruta?"
    :buttons="modalButtons"
    @result="dialogResult"
  ></ModalOverlay>
</template>

<style scoped>
  .user-view-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: max-content max-content 1fr;
    align-items: center;
  }
  .buttons-grid {
    display: grid;
    column-gap: 16px;
    grid-template-columns: max-content 1fr;
    grid-template-rows: repeat(2, min-content);
    align-items: center;
    justify-items: start;
  }
  .icon-delete {
    margin-top: 16px;
    cursor: pointer;
  }

  .btn-one,
  .btn-one:link,
  .btn-one:visited {
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1.3;
    padding: 0 0 4px 0;
  }

  @media (max-width: 640px) {
    .buttons-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(3, min-content);
      row-gap: 8px;
    }
  }
</style>
