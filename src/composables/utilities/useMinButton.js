import { onMounted, onUnmounted, ref } from 'vue'

export function useMinButton(elRef, offset) {
  const iniPos = ref(0)
  const presentPos = ref(0)
  const minButton = ref(false)

  onMounted(() => {
    iniPos.value = elRef.value.getBoundingClientRect().top
    document.addEventListener('scroll', scrollGap)
  })

  onUnmounted(() => {
    document.removeEventListener('scroll', scrollGap)
  })

  function scrollGap() {
    if (!elRef.value) return

    presentPos.value = elRef.value.getBoundingClientRect().top
    const showSummary = presentPos.value < iniPos.value - offset

    if (showSummary && !minButton.value) {
      minButton.value = true
    } else if (!showSummary && minButton.value) {
      minButton.value = false
    }
  }

  return {
    minButton,
  }
}
