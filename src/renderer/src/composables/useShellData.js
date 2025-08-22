import { ref, computed } from 'vue'

// Global data state
const globalData = ref({
  shellHistory: null,
  statsOnly: null, // Statistics-only data cache
  lastUpdate: null,
  lastStatsUpdate: null, // Statistics data update time
  loading: false,
  statsLoading: false, // Statistics data loading state
  error: null,
  preloaded: false // Added: preload status flag
})

// Cache time (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000
// Statistics data cache time (10 minutes, longer cache)
const STATS_CACHE_DURATION = 10 * 60 * 1000

// Preload status tracking
let preloadPromise = null

// Check if cache is valid
const isCacheValid = computed(() => {
  if (!globalData.value.lastUpdate || !globalData.value.shellHistory) {
    return false
  }
  
  const now = Date.now()
  const elapsed = now - globalData.value.lastUpdate
  return elapsed < CACHE_DURATION
})

// Check if statistics data cache is valid
const isStatsCacheValid = computed(() => {
  if (!globalData.value.lastStatsUpdate || !globalData.value.statsOnly) {
    return false
  }
  
  const now = Date.now()
  const elapsed = now - globalData.value.lastStatsUpdate
  return elapsed < STATS_CACHE_DURATION
})

// Functions to get data
export const useShellData = () => {
  // Get shell history data
  const getShellHistory = async (forceRefresh = false) => {
    // If cache is valid and not force refresh, return cached data directly
    if (!forceRefresh && isCacheValid.value) {
      console.log('Using cached shell history data')
      return globalData.value.shellHistory
    }

    // If loading, wait for completion
    if (globalData.value.loading) {
      console.log('Waiting for ongoing shell history request...')
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (!globalData.value.loading) {
            if (globalData.value.error) {
              reject(globalData.value.error)
            } else {
              resolve(globalData.value.shellHistory)
            }
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    try {
      globalData.value.loading = true
      globalData.value.error = null
      console.log('Fetching fresh shell history data...')

      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('get-shell-history')

      if (result.success) {
        globalData.value.shellHistory = result
        globalData.value.lastUpdate = Date.now()
        console.log('Shell history data updated successfully')
        return result
      } else {
        throw new Error(result.error || 'Failed to fetch shell history')
      }
    } catch (error) {
      console.error('Error fetching shell history:', error)
      globalData.value.error = error
      throw error
    } finally {
      globalData.value.loading = false
    }
  }

  // Get lightweight statistics data (preferred, no raw records)
  const getStatsOnly = async (forceRefresh = false) => {
    // If statistics cache is valid and not force refresh, return cache directly
    if (!forceRefresh && isStatsCacheValid.value) {
      console.log('Using cached stats-only data')
      return globalData.value.statsOnly
    }

    // If loading statistics data, wait for completion
    if (globalData.value.statsLoading) {
      console.log('Waiting for ongoing stats-only request...')
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (!globalData.value.statsLoading) {
            if (globalData.value.error) {
              reject(globalData.value.error)
            } else {
              resolve(globalData.value.statsOnly)
            }
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    try {
      globalData.value.statsLoading = true
      globalData.value.error = null
      console.log('Fetching lightweight stats data...')

      // @ts-ignore
      const result = await window.electron.ipcRenderer.invoke('get-shell-stats-only')

      if (result.success) {
        globalData.value.statsOnly = result
        globalData.value.lastStatsUpdate = Date.now()
        console.log('Stats-only data updated successfully')
        return result
      } else {
        throw new Error(result.error || 'Failed to fetch stats-only data')
      }
    } catch (error) {
      console.error('Error fetching stats-only data:', error)
      globalData.value.error = error
      throw error
    } finally {
      globalData.value.statsLoading = false
    }
  }

  // Get specific statistics data (optimized version, prefer lightweight data)
  const getStats = async () => {
    try {
      // Try lightweight data first
      const data = await getStatsOnly()
      
      if (data?.analysis) {
        const analysis = data.analysis
        return {
          totalCommands: analysis.totalCommands || 0,
          activeDays: analysis.timeAnalysis?.activeDays || 0,
          uniqueCommands: analysis.commandAnalysis?.uniqueCommandsCount || 0,
          topCommands: analysis.commandAnalysis?.topMainCommands || {},
          shells: analysis.shells || {},
          timePatterns: analysis.timeAnalysis || {}
        }
      }
    } catch (error) {
      console.warn('Failed to get stats-only data, falling back to full data:', error)
    }

    // Fallback to complete data
    const data = await getShellHistory()
    
    if (!data?.analysis) {
      return {
        totalCommands: 0,
        activeDays: 0,
        uniqueCommands: 0
      }
    }

    const analysis = data.analysis
    return {
      totalCommands: analysis.totalCommands || 0,
      activeDays: analysis.timeAnalysis?.activeDays || 0,
      uniqueCommands: analysis.commandAnalysis?.uniqueCommandsCount || 0,
      topCommands: analysis.commandAnalysis?.topMainCommands || {},
      shells: analysis.shells || {},
      timePatterns: analysis.timeAnalysis || {}
    }
  }

  // Get weekly activity data
  const getWeeklyActivity = async () => {
    const data = await getShellHistory()
    
    if (!data?.entries) {
      return Array(7).fill(0)
    }

    const weekCounts = Array(7).fill(0)
    data.entries.forEach((entry) => {
      if (entry.timestamp) {
        const date = new Date(entry.timestamp)
        const dayOfWeek = date.getDay()
        weekCounts[dayOfWeek]++
      }
    })

    return weekCounts
  }

  // Get top commands
  const getTopCommands = async (limit = 10) => {
    try {
      // Try lightweight data first
      const data = await getStatsOnly()
      
      if (data?.analysis?.commandAnalysis?.topMainCommands) {
        const commands = data.analysis.commandAnalysis.topMainCommands
        return Object.entries(commands)
          .slice(0, limit)
          .map(([command, count]) => ({ command, count }))
      }
    } catch (error) {
      console.warn('Failed to get top commands from stats-only data, falling back to full data:', error)
    }

    // Fallback to complete data
    const data = await getShellHistory()
    
    if (!data?.analysis?.commandAnalysis?.topMainCommands) {
      return []
    }

    const commands = data.analysis.commandAnalysis.topMainCommands
    return Object.entries(commands)
      .slice(0, limit)
      .map(([command, count]) => ({ command, count }))
  }

  // Get recent commands
  const getRecentCommands = async (limit = 20) => {
    const data = await getShellHistory()
    
    if (!data?.entries) {
      return []
    }

    return data.entries
      .slice(0, limit)
      .map(entry => ({
        command: entry.command,
        timestamp: entry.timestamp,
        shell: entry.shell
      }))
  }

  // Get shell distribution
  const getShellDistribution = async () => {
    try {
      // Try lightweight data first
      const data = await getStatsOnly()
      
      if (data?.analysis?.shells) {
        return data.analysis.shells
      }
    } catch (error) {
      console.warn('Failed to get shell distribution from stats-only data, falling back to full data:', error)
    }

    // Fallback to complete data
    const data = await getShellHistory()
    
    if (!data?.analysis?.shells) {
      return {}
    }

    return data.analysis.shells
  }

  // Get daily statistics data
  const getDailyStats = async () => {
    const data = await getShellHistory()
    
    if (!data?.entries) {
      return {}
    }

    const daily = {}
    data.entries.forEach((entry) => {
      if (entry.timestamp) {
        const date = new Date(entry.timestamp)
        const dateKey = date.toISOString().split('T')[0]
        daily[dateKey] = (daily[dateKey] || 0) + 1
      }
    })

    return daily
  }

  // Get time patterns (lightweight)
  const getTimePatterns = async () => {
    try {
      // Try lightweight data first
      const data = await getStatsOnly()
      
      if (data?.analysis?.timeAnalysis) {
        return data.analysis.timeAnalysis
      }
    } catch (error) {
      console.warn('Failed to get time patterns from stats-only data, falling back to full data:', error)
    }

    // Fallback to complete data
    const data = await getShellHistory()
    
    if (!data?.analysis?.timeAnalysis) {
      return {}
    }

    return data.analysis.timeAnalysis
  }

  // Preload core statistics data (called at app startup)
  const preloadCoreData = async () => {
    if (globalData.value.preloaded || preloadPromise) {
      return preloadPromise
    }

    console.log('🚀 Starting core data preload...')
    preloadPromise = (async () => {
      try {
        // Parallel preload core data
        const promises = [
          getStatsOnly(), // Preload statistics data
        ]
        
        await Promise.all(promises)
        globalData.value.preloaded = true
        console.log('✅ Core data preload completed')
        
        return true
      } catch (error) {
        console.error('❌ Core data preload failed:', error)
        // 预加载失败不应该阻塞应用启动
        return false
      }
    })()

    return preloadPromise
  }

  // 手动刷新数据
  const refreshData = async () => {
    return await getShellHistory(true)
  }

  return {
    // 数据状态
    isLoading: computed(() => globalData.value.loading),
    hasError: computed(() => !!globalData.value.error),
    lastUpdate: computed(() => globalData.value.lastUpdate),
    isPreloaded: computed(() => globalData.value.preloaded),
    
    // 缓存状态
    isStatsCacheValid,
    
    // 数据获取方法
    getShellHistory,
    getStatsOnly,
    getStats,
    getWeeklyActivity,
    getTopCommands,
    getRecentCommands,
    getShellDistribution,
    getDailyStats,
    getTimePatterns,
    refreshData,
    
    // 预加载方法
    preloadCoreData
  }
}
