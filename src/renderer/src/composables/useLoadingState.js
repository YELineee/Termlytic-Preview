import { ref, computed } from 'vue'

// 全局加载状态管理
const globalLoadingState = ref({
  app: false, // 应用初始化加载
  dashboard: false, // 仪表板数据加载
  heatmap: false, // 热力图数据加载
  tickets: false, // 票据数据加载
  settings: false, // 设置页面加载
  components: new Map() // 组件级加载状态
})

// 加载状态计数器
const loadingCounter = ref({
  total: 0,
  completed: 0
})

export const useLoadingState = () => {
  // 设置全局加载状态
  const setGlobalLoading = (type, loading) => {
    globalLoadingState.value[type] = loading
  }

  // 设置组件加载状态
  const setComponentLoading = (componentName, loading) => {
    if (loading) {
      globalLoadingState.value.components.set(componentName, true)
    } else {
      globalLoadingState.value.components.delete(componentName)
    }
  }

  // 批量加载管理
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

  // 计算属性
  const isAnyLoading = computed(() => {
    return Object.values(globalLoadingState.value)
      .filter(value => typeof value === 'boolean')
      .some(loading => loading) || 
      globalLoadingState.value.components.size > 0
  })

  const isAppLoading = computed(() => globalLoadingState.value.app)
  const isDashboardLoading = computed(() => globalLoadingState.value.dashboard)
  const isHeatmapLoading = computed(() => globalLoadingState.value.heatmap)
  const isTicketsLoading = computed(() => globalLoadingState.value.tickets)
  const isSettingsLoading = computed(() => globalLoadingState.value.settings)

  const loadingProgress = computed(() => {
    if (loadingCounter.value.total === 0) return 0
    return Math.round((loadingCounter.value.completed / loadingCounter.value.total) * 100)
  })

  const activeComponents = computed(() => {
    return Array.from(globalLoadingState.value.components.keys())
  })

  // 便捷方法
  const withLoading = async (type, asyncFn) => {
    try {
      setGlobalLoading(type, true)
      return await asyncFn()
    } finally {
      setGlobalLoading(type, false)
    }
  }

  const withComponentLoading = async (componentName, asyncFn) => {
    try {
      setComponentLoading(componentName, true)
      return await asyncFn()
    } finally {
      setComponentLoading(componentName, false)
    }
  }

  return {
    // 状态
    isAnyLoading,
    isAppLoading,
    isDashboardLoading,
    isHeatmapLoading,
    isTicketsLoading,
    isSettingsLoading,
    loadingProgress,
    activeComponents,

    // 方法
    setGlobalLoading,
    setComponentLoading,
    startBatchLoading,
    incrementCompleted,
    resetBatchLoading,
    withLoading,
    withComponentLoading
  }
}
