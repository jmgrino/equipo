<script setup>
  import { ref } from 'vue'
  import { useRidesStore } from '@/stores/ridesStore'
  import { useRouter, useRoute } from 'vue-router'
  import { useModal } from '@/composables/utilities/useModal'
  import useStorage from '@/stores/useStorage'
  import ModalOverlay from '@/components/utilities/ModalOverlay.vue'

  const ridesStore = useRidesStore()
  const router = useRouter()
  const modal = useModal()

  const modalRide = ref({})
  const modalButtons = ref([])
  const modalParagraph = ref('')
  const blinkText = ref('')

  const cleanDatabase = async () => {
    // Clean orphaned photos in Storage

    blinkText.value = 'blinking'

    let photosStore = ridesStore.photos

    // Check if photoStore.ride exists in ridesStore.rides
    let orphanedPhotos = photosStore.filter(photo => {
      return !ridesStore.rides.some(ride => ride.id === photo.ride)
    })

    // delete orphaned photos from ridesStore.photos
    for (let photo of orphanedPhotos) {
      await ridesStore.deletePhoto(photo.id)
    }

    // Clean orphaned files in Storage
    let photoPaths = photosStore.map(photo => photo.filePath)

    // Remove duplicates from photoPaths
    photoPaths = [...new Set(photoPaths)]

    let { removeOrphanedFiles } = useStorage('photos')

    const photoFiles = await removeOrphanedFiles(photoPaths)

    // ===================================================
    // Clean orphaned tracks in storage

    let tracksStore = ridesStore.tracks

    // Check if tracksStore.ride exists in ridesStore.rides
    let orphanedTracks = tracksStore.filter(track => {
      return !ridesStore.rides.some(ride => ride.id === track.ride)
    })

    // delete orphaned tracks from ridesStore.tracks
    for (let track of orphanedTracks) {
      await ridesStore.deleteTrack(track.id)
    }

    // Clean orphaned files in Storage
    let trackPaths = tracksStore.map(track => track.filePath)

    // Remove duplicates from trackPaths
    trackPaths = [...new Set(trackPaths)]

    let { removeOrphanedFiles: removeOrphanedTrackFiles } = useStorage('tracks')

    const trackFiles = await removeOrphanedTrackFiles(trackPaths)

    modalRide.value.name = 'Limpiar base de datos'

    modalParagraph.value = `Ficheros borrados: ${photoFiles.length} fotos y ${trackFiles.length} tracks.`
    modalButtons.value = [{ label: 'Aceptar', type: 'submit' }]

    blinkText.value = ''

    modal.showModal(ModalOverlay)
    const result = await modal.waitAnswer()
  }
</script>

<template>
  <div class="bg-white shadow-md max-w-7xl mx-auto p-4 sm:max-w-full sm:shadow-none">
    <div class="header-grid">
      <span class="text-cs-h4 text-color-std-high-tint sm:row-start-2">Herramientas</span>

      <div class="justify-self-end flex gap-5 sm:row-start-1">
        <CancelButton
          label="Volver"
          @onClick="router.push({ name: 'rides' })"
        />
      </div>
    </div>
    <div class="tools-grid mt-12">
      <h3 class="text-cs-h3">Limpiar base de datos</h3>
      <AcceptButton
        label="Ejecutar"
        @onClick="cleanDatabase"
      />
      <p
        class="working text-cs-h3 hidden"
        :class="blinkText"
      >
        Limpiando base de datos...
      </p>
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
  .header-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: min-content min-content;
  }
  .tools-grid {
    display: grid;
    column-gap: 16px;
    row-gap: 8px;
    grid-template-columns: max-content 100px max-content;
    grid-template-rows: min-content;
  }

  .blinking {
    display: block;
    animation: blink 2s infinite;
  }

  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @media (max-width: 480px) {
    .label {
      display: none;
    }
    .header-grid {
      grid-template-columns: 1fr;
      grid-template-rows: min-content min-content;
    }
  }
</style>
