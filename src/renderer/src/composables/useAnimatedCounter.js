import { ref, watch } from 'vue'

export const useAnimatedCounter = (initialValue = 0, duration = 1000) => {
  const displayValue = ref(initialValue)
  const targetValue = ref(initialValue)
  let animationFrame = null

  const animateToValue = (newValue) => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }

    const startValue = displayValue.value
    const difference = newValue - startValue
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (easeOutExpo for smooth deceleration)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)

      displayValue.value = Math.floor(startValue + difference * easeProgress)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        displayValue.value = newValue
        animationFrame = null
      }
    }

    animationFrame = requestAnimationFrame(animate)
  }

  const setValue = (newValue) => {
    targetValue.value = newValue
    animateToValue(newValue)
  }

  const setImmediate = (newValue) => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    displayValue.value = newValue
    targetValue.value = newValue
  }

  // Watch for direct changes to targetValue
  watch(targetValue, (newVal) => {
    if (newVal !== displayValue.value) {
      animateToValue(newVal)
    }
  })

  return {
    displayValue,
    targetValue,
    setValue,
    setImmediate
  }
}
