<script setup>
  import { reactive, ref, nextTick, useTemplateRef } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useAuthStore } from '@/stores/authStore'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import IconX from '@/components/icons/IconX.vue'
  import { useModal } from '@/composables/utilities/useModal'
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'
  import { useValidation } from '@/components/form/useValidation.js'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const modal = useModal()

  const initialValues = {
    name: '',
    type: 'Carretera',
    distance: 0,
    elevation: 0,
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
  const isNew = ref(false)
  const fetching = ref(false)
  const emailRef = useTemplateRef('email-ref')
  let timeoutID

  const modalRide = ref({})
  const modalButtons = ref([])
  const modalParagraph = ref('')

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
    fetching.value = true
    const ride = await ridesStore.getRide(id)
    const dates = await ridesStore.getRideDates(id)

    formData = ridesStore.deepCopy(ride)
    const datesData = ridesStore.deepCopy(dates)

    datesData.forEach(date => {
      if (date.noDay === undefined) {
        date.noDay = false
      }
    })

    Object.assign(formData, { dates: datesData })
    pageTitle.value = ride.name
    fetching.value = false
  }

  async function submitHandler() {
    if (formHasErrors()) return

    isDisabled.value = true
    errorMessage.value = ''

    // await wait(2000)
    formData.dates.forEach(date => {
      delete date.message
      delete date.confirm
    })

    const { dates: modDates, ...modRide } = formData

    ridesStore.sortDates(modDates)

    const datesWithValidDate = modDates.filter(date => date.date !== '' && !date.canceled)

    if (datesWithValidDate.length > 0) {
      modRide.date = datesWithValidDate[0].date
      modRide.lastDate = datesWithValidDate.reverse()[0].date
    } else {
      modRide.date = ''
      modRide.lastDate = ''
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

  function cancelHandler() {
    router.back()
  }

  async function deleteRide() {
    modalRide.value = formData
    modalRide.value.id = route.params.id

    modalParagraph.value = '¿Seguro que quieres borrar esta ruta?'
    modalButtons.value = [
      { label: 'Cancelar', type: 'cancel' },
      { label: 'Borrar', type: 'submit' },
    ]

    modal.showModal(ModalOverlay)
    const result = await modal.waitAnswer()

    if (result) {
      ridesStore.deleteRide(modalRide.value.id)
      router.push({ name: 'rides' })
    }
  }

  function addDate() {
    formData.dates.push({
      date: '',
      days: 1,
      id: 'new',
      ride: formData.id,
      owner: authStore.user.id,
      noDay: false,
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
      timeoutID = setTimeout(() => {
        formData.dates[index].message = false
        forceRender()
      }, 3000)
    } else {
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

  function cancelDate(index) {
    if (formData.dates[index].canceled) {
      formData.dates[index].canceled = false
    } else {
      formData.dates[index].canceled = true
    }
    forceRender()
  }

  function manageTracks() {
    router.push({ name: 'tracks', params: { id: formData.id } })
  }

  const forceRender = async () => {
    renderDates.value = false
    await nextTick()
    renderDates.value = true
  }

  function uploadFoto() {
    router.push({ name: 'photo', params: { id: formData.id } })
  }

  function mensualChanged(checked, index) {
    let month
    let year
    let newDate

    if (checked) {
      if (formData.dates[index].date) {
        month = +formData.dates[index].date.substring(5, 7)
        year = +formData.dates[index].date.substring(0, 4)
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

      formData.dates[index].date = strYear + '-' + strMonth + '-' + strDay

      forceRender()
    }
  }

  const { processElemError, errors, errorMessage, formHasErrors } = useValidation({
    name: {
      required: 'El nombre es obligatorio',
      maxChars: 'El nombre de la ruta no puede tener mas de {setValue}  caracteres',
    },
    note: {
      maxChars: 'Las notas no puede tener mas de {setValue}  caracteres, pero tiene {actualValue}',
    },
    days: {
      min: '>= {setValue}',
      max: '<= {setValue}',
    },
    date: {
      badInput: 'Fecha invalida',
    },
  })

  async function setFocus() {
    await nextTick() // waits until the DOM is reset and ready
    emailRef.value.inputRef.focus()
  }

  setFocus()
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto md:max-w-full md:shadow-none">
    <div class="flex sm:flex-col-reverse justify-between items-left pt-5 px-10 gap-8">
      <template v-if="fetching">
        <h2 class="text-2xl">Esperando datos...</h2>
      </template>
      <template v-else>
        <h2 class="text-4xl font-black">{{ pageTitle }}</h2>
        <div class="flex gap-x-4 self-end">
          <AcceptButton
            v-show="!isNew"
            label="Foto"
            @onClick="uploadFoto"
          />
          <AcceptButton
            v-show="!isNew"
            label="Tracks"
            @onClick="manageTracks"
          />
        </div>
      </template>
    </div>
    <form
      class="mt-5 p-10 w-full"
      novalidate
      @submit.prevent="submitHandler"
    >
      <div class="user-view-grid">
        <BaseInput
          class="col-span-full"
          ref="email-ref"
          label="Nombre"
          v-model="formData.name"
          maxChars="80"
          required
          error-id="name"
          :error="errors.name"
          @elemError="processElemError"
        />

        <BaseSelect
          label="Tipo de ruta"
          :options="rideType"
          v-model="formData.type"
        />
        <BaseInput
          class="sm:col-start-1"
          label="Distancia (km)"
          type="number"
          min="0"
          error-id="distance"
          v-model="formData.distance"
          :error="errors.distance"
          @elemError="processElemError"
        />
        <BaseInput
          label="Desnivel (m)"
          type="number"
          min="0"
          error-id="elevation"
          v-model="formData.elevation"
          :error="errors.elevation"
          @elemError="processElemError"
        />

        <template v-if="renderDates">
          <template
            v-for="(date, index) in formData.dates"
            :key="index"
          >
            <div
              class="flex items-center col-start-1"
              :class="{ canceled: date.canceled === true }"
            >
              <BaseInputDate
                :label="date.canceled ? 'Fecha cancelada' : 'Fecha'"
                type="text"
                v-model="formData.dates[index].date"
                :disabled="date.users && date.users.length > 0"
                :error-id="`date$${index}`"
                :error="errors[`date$${index}`]"
                @elemError="processElemError"
              />
            </div>
            <div :class="{ canceled: date.canceled === true, flex: true }">
              <BaseInput
                label="Dias"
                type="number"
                v-model="formData.dates[index].days"
                :disabled="date.users && date.users.length > 0"
                width="50px"
                min="1"
                :error-id="`days$${index}`"
                :error="errors[`days$${index}`]"
                @elemError="processElemError"
              />
              <BaseCheckbox
                label="Mensual"
                v-model="formData.dates[index].noDay"
                :disabled="date.users && date.users.length > 0"
                @inputChanged="checked => mensualChanged(checked, index)"
              />
            </div>
            <div
              v-if="date.message"
              class="sm:col-span-full col-span-2"
            >
              <span class="inline-block text-[red] text-cs-std mr-4 mb-2">Hay ciclistas apuntados</span>
              <AcceptButton
                @click="confirmDeleteDate(index)"
                label="Confirmar borrado"
              />
            </div>
            <div
              v-else-if="date.confirm"
              class="sm:col-span-full col-span-2"
            >
              <AcceptButton
                @click="confirmDeleteDate(index)"
                label="Confirmar borrado"
              />
            </div>
            <div
              v-else
              class="flex sm:col-start-2 sm:justify-end"
              :class="{ canceled: date.canceled === true }"
            >
              <IconDelete
                class="icon icon-delete"
                size="3.2rem"
                title="Borrar fecha"
                @click="deleteDate(index)"
              >
              </IconDelete>
              <IconX
                class="icon icon-x"
                size="3.2rem"
                title="Cancelar fecha"
                @click="cancelDate(index)"
              >
              </IconX>
            </div>
            <div class="col-span-full border-b-2"></div>
          </template>
        </template>
        <div class="col-span-full">
          <AcceptButton
            label="Añadir fecha"
            @click="addDate"
          />
        </div>
        <BaseTextarea
          class="col-span-full"
          label="Notas"
          v-model="formData.note"
          rows="6"
          maxChars="1024"
          verbose
          error-id="note"
          :error="errors.note"
          @elemError="processElemError"
        />
      </div>

      <div class="pt-8 buttons-grid">
        <div
          class="sm:justify-self-center justify-self-end row-start-1 col-start-2 sm:col-start-1 sm:col-span-2 flex flex-wrap items-center content-center justify-end gap-x-4"
        >
          <CancelButton
            label="Cancelar"
            @onClick="cancelHandler"
          />
          <AcceptButton
            :label="submitLabel"
            type="submit"
          />
        </div>

        <span class="col-span-2 p-2 text-[red] text-xl sm:justify-self-center justify-self-end">{{ errorMessage }}</span>

        <AcceptButton
          v-show="!isNew"
          class="btn btn-std btn-submit justify-self-center row-start-1 col-start-1 sm:row-start-2"
          label="Borrar ruta"
          @click="deleteRide"
        />
      </div>
    </form>
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
    grid-template-columns: repeat(3, 150px) 1fr;
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
  .icon {
    margin-top: 16px;
    cursor: pointer;
  }

  .icon:hover {
    color: var(--color-std-high);
  }

  .btn-one,
  .btn-one:link,
  .btn-one:visited {
    font-size: 2.4rem;
    font-weight: 400;
    line-height: 1.3;
    padding: 0 0 4px 0;
  }

  .canceled {
    color: rgba(90, 118, 135, 0.5);
  }

  @media (max-width: 640px) {
    .user-view-grid {
      grid-template-columns: repeat(3, 140px) 1fr;
    }
  }

  @media (max-width: 480px) {
    .user-view-grid {
      grid-template-columns: repeat(2, 150px) 1fr;
      align-items: center;
    }
    .buttons-grid {
      grid-template-columns: 1fr;
      grid-template-rows: repeat(3, min-content);
      row-gap: 8px;
    }
    .icon {
      margin-top: 8px;
      margin-bottom: 8px;
    }
  }
</style>
