<script setup>
  import { reactive, ref, computed, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useRidesStore } from '@/stores/ridesStore'
  import useStorage from '@/composables/useStorage'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import IconDownload from '@/components/icons/IconDownload.vue'
  import SubmitButton from '@/components/form/SubmitButton.vue'
  import InputFile from '@/components/form/InputFile.vue'

  const MAX_SIZE_KB = 1000
  const VALID_EXT = '.jpg,.png,.jpeg'

  const ridesStore = useRidesStore()
  const { url, filePath, uploadFile, deleteFile } = useStorage('photos')
  const router = useRouter()
  const route = useRoute()

  const showForm = ref(false)
  const fetching = ref(false)
  const pageTitle = ref('')
  const renderDates = ref(true)
  const errorMessages = ref([])
  const showName = ref(false)
  const canAddPhoto = ref(false)
  const selectedPhoto = ref('')

  let ride = reactive({})
  let photos = ref([])
  let timeoutID

  const formData = reactive({
    name: '',
    file: null,
  })

  getRide(route.params.id)

  async function getRide(id) {
    fetching.value = true

    ride = await ridesStore.getRide(id)

    await ridesStore.checkValidPhotos()

    const allPhotos = computed(() => {
      return ridesStore.deepCopy(ridesStore.photos)
    })

    photos.value = allPhotos.value.filter(photo => photo.ride === ride.id)

    pageTitle.value = ride.name

    fetching.value = false
  }

  function showPhotoFields(value) {
    showForm.value = value
    if (value) {
      canAddPhoto.value = false
    }
  }

  async function addPhoto() {
    clearArray(errorMessages.value)
    const file = formData.file

    await uploadFile(ride.id, file)

    const photo = {
      name: formData.name,
      ride: ride.id,
      url: url.value,
      filePath: filePath.value,
    }

    const newId = await ridesStore.addPhoto(photo)

    photos.value.push({
      id: newId,
      ...photo,
    })

    formData.name = ''
    formData.file = null

    showName.value = false
    showForm.value = false
    forceRender()
  }

  function cancelAddPhoto() {
    showForm.value = false
    clearArray(errorMessages.value)
    formData.name = ''
    formData.file = null
  }

  function deletePhoto(index) {
    photos.value[index].confirm = true
    timeoutID = setTimeout(() => {
      photos.value[index].confirm = false
      forceRender()
    }, 3000)

    forceRender()
  }

  async function confirmDeletePhoto(index) {
    clearTimeout(timeoutID)
    await deleteFile(photos.value[index].filePath)
    await ridesStore.deletePhoto(photos.value[index].id)
    photos.value.splice(index, 1)

    forceRender()
  }

  function fileSelected(e) {
    let validFile = false
    clearArray(errorMessages.value)
    if (e.srcElement.files.length > 0) {
      validFile = true
      const nameWithExt = e.srcElement.files[0].name
      const fileSize = e.srcElement.files[0].size
      const name = nameWithExt.substr(0, nameWithExt.lastIndexOf('.'))
      const nameCap = name.charAt(0).toUpperCase() + name.slice(1)

      if (!checkExt(nameWithExt)) {
        const errorMessage = `Solo se admiten ficheros con extension ${VALID_EXT}`
        validFile = false
        errorMessages.value.push(errorMessage)
      }

      if (!checkSize(fileSize)) {
        const maxSizeMbites = Math.trunc(MAX_SIZE_KB / 1000)
        const fileSizeMbites = Math.trunc(fileSize / 1000000)
        const errorMessage = `Fichero demasiado grande (más de ${fileSizeMbites} Mbytes). Tamaño máximo ${maxSizeMbites} Mbytes`

        errorMessages.value.push(errorMessage)
        validFile = false
      }

      formData.name = nameCap
      formData.file = e.srcElement.files[0]
    }

    if (validFile) {
      canAddPhoto.value = true
    }
  }

  function checkSize(fileSize) {
    const maxSizeBites = MAX_SIZE_KB * 1000

    if (fileSize > maxSizeBites) {
      return false
    } else {
      return true
    }
  }

  function checkExt(fileName) {
    const fileAccept = VALID_EXT
    const fileExt = '.' + fileName.split('.').pop().toLowerCase()
    return fileAccept.includes(fileExt)
  }

  const forceRender = async () => {
    renderDates.value = false
    await nextTick()
    renderDates.value = true
  }

  function displayPhoto(photo) {
    selectedPhoto.value = photo
  }

  function clearArray(array) {
    while (array.length > 0) {
      array.pop()
    }
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto md:max-w-full md:shadow-none">
    <div class="flex justify-between items-center pt-5 px-10 gap-x-4">
      <template v-if="fetching">
        <h2 class="text-2xl">Esperando datos...</h2>
      </template>
      <template v-else>
        <h2 class="text-4xl font-black">{{ pageTitle }}</h2>
        <button
          class="btn btn-std btn-submit mb-4"
          @click.prevent="router.back()"
        >
          Volver
        </button>
      </template>
    </div>
    <div
      v-if="!fetching"
      class="pt-5 px-10"
    >
      <template v-if="renderDates">
        <div
          v-for="(photo, index) in photos"
          :key="index"
          class="photo-flex mb-4"
        >
          <!-- <span class="text-cs-h3 col-start-1">{{ photo.name }}</span> -->
          <span
            class="text-cs-h3 cursor-pointer hover:text-color-std-high"
            @click="displayPhoto(photo)"
            >{{ photo.name }}</span
          >
          <div
            v-if="photo.confirm"
            class="sm:col-start-1 sm:col-span-3"
          >
            <button
              class="btn btn-std btn-submit"
              @click="confirmDeletePhoto(index)"
            >
              Confirmar borrado
            </button>
          </div>
          <div v-else>
            <IconDelete
              class="icon ml-4"
              size="3.2rem"
              title="Borrar foto"
              @click="deletePhoto(index)"
            >
            </IconDelete>
          </div>
          <a :href="photo.url">
            <IconDownload
              class="icon"
              size="3.2rem"
              title="Descargar foto"
            >
            </IconDownload>
          </a>
        </div>
      </template>
    </div>

    <div
      v-if="!showForm"
      class="pt-10 px-10"
    >
      <SubmitButton
        label="Añadir foto"
        class="my-4"
        @OnClick="showPhotoFields(true)"
      />
    </div>

    <div
      v-if="showForm"
      class="pt-14 px-10"
    >
      <form class="load-form-grid">
        <InputFile
          label="Cargar photo"
          name="photo"
          :accept="VALID_EXT"
          @onChange="fileSelected"
        />
        <InputText
          name="filename"
          class="mt-2 sm:col-span-full sm:mt-6"
          v-model="formData.name"
        />
        <p class="col-span-full text-gray-400">{{ formData.file ? 'Fichero: ' + formData.file?.name : '' }}</p>
        <div
          v-if="errorMessages.length > 0"
          class="col-span-full text-16px text-red-600"
        >
          <p v-for="errorMessage in errorMessages">
            {{ errorMessage }}
          </p>
        </div>
        <div class="col-span-full justify-self-end my-8">
          <CancelButton
            label="Cancelar"
            @onClick="cancelAddPhoto"
            class="mr-4"
          />
          <SubmitButton
            label="Añadir"
            @onClick="addPhoto"
            :disabled="!canAddPhoto"
          />
        </div>
      </form>
      <hr />
    </div>
    <div
      v-if="selectedPhoto"
      class="mt-8 px-10"
    >
      <p class="text-cs-h3">{{ selectedPhoto.name }}</p>
      <img
        :src="selectedPhoto.url"
        alt="Selected photo"
        class="w-full"
      />
    </div>
  </div>
</template>

<style scoped>
  .photo-flex {
    display: flex;
    column-gap: 8px;
    word-wrap: break-word;
  }
  .add-photo-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    align-items: start;
    grid-template-columns: 1fr;
  }
  .load-form-grid {
    display: grid;
    grid-template-columns: max-content 1fr;
    align-content: center;
    column-gap: 16px;
  }
  .icon {
    cursor: pointer;
  }
  .icon:hover {
    color: var(--color-std-high);
  }

  @media (max-width: 640px) {
    .add-photo-grid {
      grid-template-columns: 1fr;
    }
    .photo-grid {
      grid-template-columns: minmax(70%, max-content) max-content min-content 1fr;
    }
  }
</style>
