<script setup>
  import { reactive, ref, computed, nextTick } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useAuthStore } from '@/stores/authStore'
  import useStorage from '@/composables/useStorage'
  import IconDelete from '@/components/icons/IconDelete.vue'
  import IconDownload from '@/components/icons/IconDownload.vue'

  const ridesStore = useRidesStore()
  const authStore = useAuthStore()
  const { url, filePath, uploadFile, deleteFile } = useStorage('tracks')
  const router = useRouter()
  const route = useRoute()

  const showFormkit = ref(false)
  const fetching = ref(false)
  const pageTitle = ref('')
  const renderDates = ref(true)
  const errorMessage = ref('')
  const showName = ref(false)

  let ride = reactive({})
  let tracks = ref([])
  let timeoutID

  const formData = reactive({
    name: '',
    file: null,
  })

  getRide(route.params.id)

  async function getRide(id) {
    fetching.value = true

    ride = await ridesStore.getRide(id)

    await ridesStore.checkValidTracks()

    const allTracks = computed(() => {
      return ridesStore.deepCopy(ridesStore.tracks)
    })

    tracks.value = allTracks.value.filter(track => track.ride === ride.id)

    pageTitle.value = ride.name
    if (tracks.value.length === 0) {
      formData.name = ride.name
    }

    fetching.value = false
  }

  function showTrackFields(value) {
    showFormkit.value = value
  }

  async function addTrack() {
    errorMessage.value = ''
    const file = formData.file[0].file

    await uploadFile(ride.id, file)

    const track = {
      name: formData.name,
      ride: ride.id,
      url: url.value,
      filePath: filePath.value,
    }

    const newId = await ridesStore.addTrack(track)

    tracks.value.push({
      id: newId,
      ...track,
    })

    formData.name = ''
    formData.file = null

    showName.value = false
    showFormkit.value = false
    forceRender()
  }

  function deleteTrack(index) {
    tracks.value[index].confirm = true
    timeoutID = setTimeout(() => {
      tracks.value[index].confirm = false
      forceRender()
    }, 3000)

    forceRender()
  }

  async function confirmDeleteTrack(index) {
    clearTimeout(timeoutID)
    await deleteFile(tracks.value[index].filePath)
    await ridesStore.deleteTrack(tracks.value[index].id)
    tracks.value.splice(index, 1)

    forceRender()
  }

  function fileSelected(e) {
    if (e.srcElement.files.length > 0) {
      const nameExt = e.srcElement.files[0].name
      const name = nameExt.substr(0, nameExt.lastIndexOf('.'))
      const nameCap = name.charAt(0).toUpperCase() + name.slice(1)
      showName.value = true
      formData.name = nameCap
    } else {
      showName.value = true
      formData.name = ''
    }
  }

  function showErrors(node) {
    // const validations = getValidationMessages(node)
    errorMessage.value = 'No se pudo enviar, revisa los mensajes'
  }

  function size(node, maxSize) {
    const fileSize = node.value[0].file.size
    const maxSizeBites = maxSize * 1000

    const fileAccept = node.props.attrs.accept
    const fileName = node.value[0].file.name
    const fileExt = '.' + fileName.split('.').pop().toLowerCase()
    if (!fileAccept.includes(fileExt)) return false

    if (fileSize > maxSizeBites) {
      return false
    } else {
      return true
    }
  }

  function sizeValidation(node) {
    const fileAccept = node.node.props.attrs.accept
    const fileName = node.node.value[0].file.name
    const fileExt = '.' + fileName.split('.').pop().toLowerCase()

    const fileSizeMbites = Math.trunc(node.node.value[0].file.size / 1000000)
    const maxSizeMbites = Math.trunc(node.args[0] / 1000)

    if (!fileAccept.includes(fileExt)) {
      return `Solo se admiten ficheros con extension ${fileAccept}`
    } else {
      return `Fichero demasiado grande (más de ${fileSizeMbites} Mbytes). Tamaño máximo ${maxSizeMbites} Mbytes`
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
      class="track-grid pt-5 px-10"
    >
      <template v-if="renderDates">
        <template
          v-for="(track, index) in tracks"
          :key="index"
        >
          <span class="text-cs-h3 col-start-1">{{ track.name }}</span>
          <div
            v-if="track.confirm"
            class="sm:col-start-1 sm:col-span-3"
          >
            <button
              class="btn btn-std btn-submit"
              @click="confirmDeleteTrack(index)"
            >
              Confirmar borrado
            </button>
          </div>
          <div v-else>
            <IconDelete
              class="icon ml-4"
              size="3.2rem"
              title="Borrar track"
              @click="deleteTrack(index)"
            >
            </IconDelete>
          </div>
          <a :href="track.url">
            <IconDownload
              class="icon"
              size="3.2rem"
              title="Descargar track"
            >
            </IconDownload>
          </a>
        </template>
      </template>

      <div
        v-if="showFormkit"
        class="col-span-full"
      >
        <FormKit
          type="form"
          form-class="add-track-grid"
          :actions="false"
          @submit="addTrack"
          @submit-invalid="showErrors"
          validation-visibility="submit"
          :incomplete-message="false"
          :value="formData"
        >
          <FormKit
            label="Fichero"
            outer-class="w-full"
            type="file"
            name="file"
            accept=".gpx"
            multiple="false"
            placeholder="Nombre del track"
            validation="required|size:15000"
            :validation-rules="{ size }"
            :validation-messages="{
              required: 'El Nombre del track es obligatorio',
              size: sizeValidation,
            }"
            v-model.trim="formData.file"
            @change="fileSelected"
          />
          <FormKit
            v-show="showName"
            label="Nombre"
            outer-class="w-full"
            type="text"
            name="name"
            placeholder="Nombre del track"
            validation="required"
            :validation-messages="{ required: 'El Nombre del track es obligatorio' }"
            v-model.trim="formData.name"
          />
          <div class="flex gap-4 ml-2 col-span-full justify-self-end">
            <FormKit
              v-if="showFormkit"
              type="button"
              label="Cancelar"
              outer-class="cancel-button sm:justify-self-end"
              wrapper-class="mt-6"
              @click.prevent="showTrackFields(false)"
            />

            <FormKit
              v-if="showFormkit"
              type="submit"
              label="Añadir"
              outer-class="submit-button"
              wrapper-class="mt-6"
            />
          </div>
          <span class="col-span-full text-[red] text-xl justify-self-end">{{ errorMessage }}</span>
        </FormKit>
      </div>

      <div
        v-if="!showFormkit"
        class="col-span-full"
      >
        <button
          class="btn btn-std btn-submit my-4"
          @click.prevent="showTrackFields(true)"
        >
          Añadir track
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .track-grid {
    display: grid;
    column-gap: 8px;
    row-gap: 8px;
    grid-template-columns: minmax(min-content, max-content) max-content min-content 1fr;
  }
  .add-track-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    align-items: start;
    grid-template-columns: 1fr;
  }
  .icon {
    cursor: pointer;
  }
  .icon:hover {
    color: var(--color-std-high);
  }

  @media (max-width: 640px) {
    .add-track-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
