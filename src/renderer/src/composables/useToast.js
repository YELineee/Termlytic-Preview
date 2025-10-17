import { ref } from 'vue'

// Global toast state
const toasts = ref([])
let toastId = 0

export const useToast = () => {
  const show = (message, options = {}) => {
    const {
      type = 'info', // 'success', 'error', 'warning', 'info'
      duration = 3000,
      action = null,
      dismissible = true
    } = options

    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      dismissible,
      action
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  const dismiss = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message, options = {}) => {
    return show(message, { ...options, type: 'success' })
  }

  const error = (message, options = {}) => {
    return show(message, { ...options, type: 'error', duration: 5000 })
  }

  const warning = (message, options = {}) => {
    return show(message, { ...options, type: 'warning', duration: 4000 })
  }

  const info = (message, options = {}) => {
    return show(message, { ...options, type: 'info' })
  }

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info
  }
}
