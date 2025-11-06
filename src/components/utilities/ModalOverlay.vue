<script setup>
  const props = defineProps({
    header: {
      type: String,
      default: 'Titulo',
    },
    paragraph: {
      type: String,
      default: 'descripción',
    },
    buttons: {
      type: Object,
      required: true,
    },
  })

  const emit = defineEmits(['close'])

  const onResult = answer => {
    emit('close', answer)
  }
</script>

<template>
  <teleport to="#modal">
    <transition name="fade">
      <div>
        <div class="fixed bg-black opacity-70 inset-0 z-0 pointer-events-none"></div>
        <div
          class="w-full max-w-lg p-3 fixed bottom-1/4 left-1/2 -translate-x-1/2 mx-auto my-auto rounded-xl shadow-lg bg-white"
        >
          <div>
            <div class="text-center p-3 flex-auto justify-center leading-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-16 h-16 flex items-center text-color-std-high mx-auto"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <h2 class="text-cs-h2 leading-cs-h2 font-bold py-4">{{ header }}</h2>
              <p class="text-cs-h3 leading-cs-h3 text-gray-500 px-8 mt-4">{{ paragraph }}</p>
            </div>
            <div class="p-3 mt-2 text-center space-x-4">
              <button
                v-for="button in buttons"
                :class="`btn btn-std btn-${button.type}`"
                @click="onResult(button.type === 'submit')"
              >
                {{ button.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 500ms ease-out;
  }
</style>
