import { ref, watch, markRaw } from 'vue'

// keep track of component to render
const component = ref()
// keep track of whether to show modal
const show = ref(false)
const result = ref(false)

export function useModal() {
  function showModal(comp) {
    component.value = markRaw(comp)
    show.value = true
  }

  function hideModal(res) {
    result.value = res
    show.value = false
  }

  function waitAnswer() {
    return new Promise(function (resolve, reject) {
      watch(show, () => {
        if (!show.value) {
          resolve(result.value)
        }
      })
    })
  }

  return {
    component,
    show,
    // methods to show/hide modal
    showModal,
    hideModal,
    waitAnswer,
  }
}
