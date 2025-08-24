import { ref, computed, reactive } from 'vue'

// Global loading state management
const loadingState = reactive({
  app: false, // Application initialization loading
  dashboard: false, // Dashboard data loading
  heatmap: false, // Heatmap data loading
  tickets: false, // Tickets data loading
  settings: false, // Settings page loading
  components: new Map() // Component-level loading state
})

// Loading state counter
const loadingCounter = ref({
  total: 0,
  completed: 0
})

export const useLoadingState = () => {
  // Set global loading state
  const setGlobalLoading = (type, loading) => {
    loadingState[type] = loading
  }

  // Set component loading state
  const setComponentLoading = (componentName, loading) => {
    if (loading) {
      loadingState.components.set(componentName, true)
    } else {
      loadingState.components.delete(componentName)
    }
  }

  // Batch loading management
  const startBatchLoading = (total) => {
    loadingCounter.value.total = total
    loadingCounter.value.completed = 0
  }

  const incrementCompleted = () => {
    loadingCounter.value.completed++
  }

  const resetBatchLoading = () => {
    loadingCounter.value.total = 0
    loadingCounter.value.completed = 0
  }

  // Computed properties
  const isAnyLoading = computed(() => {
    return (
      Object.values(loadingState)
        .filter((value) => typeof value === 'boolean')
        .some((loading) => loading) || loadingState.components.size > 0
    )
  })

  const isAppLoading = computed(() => loadingState.app)
  const isDashboardLoading = computed(() => loadingState.dashboard)
  const isHeatmapLoading = computed(() => loadingState.heatmap)
  const isTicketsLoading = computed(() => loadingState.tickets)
  const isSettingsLoading = computed(() => loadingState.settings)

  const loadingProgress = computed(() => {
    if (loadingCounter.value.total === 0) return 0
    return Math.round((loadingCounter.value.completed / loadingCounter.value.total) * 100)
  })

  const activeComponents = computed(() => {
    return Array.from(loadingState.components.keys())
  })

  return {
    // State
    loadingCounter,

    // Actions
    setGlobalLoading,
    setComponentLoading,
    startBatchLoading,
    incrementCompleted,
    resetBatchLoading,

    // Computed
    isAnyLoading,
    isAppLoading,
    isDashboardLoading,
    isHeatmapLoading,
    isTicketsLoading,
    isSettingsLoading,
    loadingProgress,
    activeComponents
  }
}