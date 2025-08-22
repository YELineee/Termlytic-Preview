/**
 * 统一数据服务模块
 * 提供标准化的数据获取接口，统一处理所有组件的数据需求
 * 解决数据结构不一致和重复请求的问题
 */

import { ref, computed } from 'vue'

// 全局数据缓存
const dataCache = ref({
  shellHistory: null,
  statsOnly: null,
  timeRangeStats: new Map(), // 按时间范围缓存统计数据
  yearlyData: new Map(), // 按年份缓存数据
  heatmapData: new Map(), // 按年份缓存热力图数据
  availableYears: null,
  lastUpdate: null,
  loading: false,
  error: null
})

// 缓存时间配置（毫秒）
const CACHE_CONFIG = {
  stats: 10 * 60 * 1000, // 统计数据：10分钟
  timeRange: 5 * 60 * 1000, // 时间范围数据：5分钟
  yearly: 15 * 60 * 1000, // 年度数据：15分钟
  heatmap: 10 * 60 * 1000, // 热力图数据：10分钟
  years: 30 * 60 * 1000 // 可用年份：30分钟
}

/**
 * 检查缓存是否有效
 * @param {number} timestamp - 缓存时间戳
 * @param {number} duration - 缓存持续时间
 * @returns {boolean} 缓存是否有效
 */
function isCacheValid(timestamp, duration) {
  if (!timestamp) return false
  return Date.now() - timestamp < duration
}

/**
 * 统一数据服务类
 */
export class DataService {
  constructor() {
    this.isLoading = computed(() => dataCache.value.loading)
    this.error = computed(() => dataCache.value.error)
  }

  /**
   * 获取基础统计数据
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 统计数据
   */
  async getBasicStats(forceRefresh = false) {
    const cacheKey = 'statsOnly'
    const cached = dataCache.value[cacheKey]
    
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_CONFIG.stats)) {
      console.log('Using cached basic stats')
      return cached.data
    }

    try {
      dataCache.value.loading = true
      dataCache.value.error = null

      console.log('Fetching basic stats...')
      const result = await window.electron.ipcRenderer.invoke('get-shell-stats-only')

      if (result.success) {
        const processedData = this.processBasicStats(result)
        dataCache.value[cacheKey] = {
          data: processedData,
          timestamp: Date.now()
        }
        return processedData
      } else {
        throw new Error(result.error || 'Failed to fetch basic stats')
      }
    } catch (error) {
      console.error('Error fetching basic stats:', error)
      dataCache.value.error = error.message
      throw error
    } finally {
      dataCache.value.loading = false
    }
  }

  /**
   * 获取时间范围统计数据
   * @param {string} timeRange - 时间范围 ('day', 'week', 'month', 'year')
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 时间范围统计数据
   */
  async getTimeRangeStats(timeRange, forceRefresh = false) {
    const cacheKey = `timeRange_${timeRange}`
    const cached = dataCache.value.timeRangeStats.get(cacheKey)
    
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_CONFIG.timeRange)) {
      console.log(`Using cached time range stats for ${timeRange}`)
      return cached.data
    }

    try {
      dataCache.value.loading = true
      dataCache.value.error = null

      console.log(`Fetching time range stats for ${timeRange}...`)
      const result = await window.electron.ipcRenderer.invoke('get-time-range-stats', timeRange)

      if (result.success) {
        const processedData = this.processTimeRangeStats(result.data)
        dataCache.value.timeRangeStats.set(cacheKey, {
          data: processedData,
          timestamp: Date.now()
        })
        return processedData
      } else {
        throw new Error(result.error || `Failed to fetch ${timeRange} stats`)
      }
    } catch (error) {
      console.error(`Error fetching ${timeRange} stats:`, error)
      dataCache.value.error = error.message
      throw error
    } finally {
      dataCache.value.loading = false
    }
  }

  /**
   * 获取可用年份列表
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Array>} 可用年份数组
   */
  async getAvailableYears(forceRefresh = false) {
    const cached = dataCache.value.availableYears
    
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_CONFIG.years)) {
      console.log('Using cached available years')
      return cached.data
    }

    try {
      dataCache.value.loading = true
      dataCache.value.error = null

      console.log('Fetching available years...')
      const result = await window.electron.ipcRenderer.invoke('get-available-years')

      if (result.success) {
        const years = result.data || []
        dataCache.value.availableYears = {
          data: years,
          timestamp: Date.now()
        }
        console.log('Available years fetched:', years)
        return years
      } else {
        throw new Error(result.error || 'Failed to fetch available years')
      }
    } catch (error) {
      console.error('Error fetching available years:', error)
      dataCache.value.error = error.message
      throw error
    } finally {
      dataCache.value.loading = false
    }
  }

  /**
   * 获取年度热力图数据
   * @param {number} year - 年份
   * @param {string} shellTypes - Shell类型
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 热力图数据
   */
  async getYearlyHeatmapData(year, shellTypes = 'all', forceRefresh = false) {
    const cacheKey = `heatmap_${year}_${shellTypes}`
    const cached = dataCache.value.heatmapData.get(cacheKey)
    
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_CONFIG.heatmap)) {
      console.log(`Using cached heatmap data for ${year}`)
      return cached.data
    }

    try {
      dataCache.value.loading = true
      dataCache.value.error = null

      console.log(`Fetching heatmap data for year ${year}...`)
      const result = await window.electron.ipcRenderer.invoke('get-yearly-heatmap-data', year, shellTypes)

      if (result.success) {
        dataCache.value.heatmapData.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        })
        return result.data
      } else {
        throw new Error(result.error || `Failed to fetch heatmap data for ${year}`)
      }
    } catch (error) {
      console.error(`Error fetching heatmap data for ${year}:`, error)
      dataCache.value.error = error.message
      throw error
    } finally {
      dataCache.value.loading = false
    }
  }

  /**
   * 生成命令票据数据
   * @param {number} year - 年份
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 票据数据
   */
  async generateCommandTicket(year, forceRefresh = false) {
    const cacheKey = `ticket_${year}`
    const cached = dataCache.value.yearlyData.get(cacheKey)
    
    if (!forceRefresh && cached && isCacheValid(cached.timestamp, CACHE_CONFIG.yearly)) {
      console.log(`Using cached ticket data for ${year}`)
      return cached.data
    }

    try {
      dataCache.value.loading = true
      dataCache.value.error = null

      console.log(`Generating command ticket for year ${year}...`)
      const result = await window.electron.ipcRenderer.invoke('generate-command-ticket', year)

      if (result.success) {
        dataCache.value.yearlyData.set(cacheKey, {
          data: result.data,
          timestamp: Date.now()
        })
        return result.data
      } else {
        throw new Error(result.error || `Failed to generate ticket for ${year}`)
      }
    } catch (error) {
      console.error(`Error generating ticket for ${year}:`, error)
      dataCache.value.error = error.message
      throw error
    } finally {
      dataCache.value.loading = false
    }
  }

  /**
   * 处理基础统计数据
   * @param {Object} rawData - 原始数据
   * @returns {Object} 处理后的数据
   */
  processBasicStats(rawData) {
    const analysis = rawData.analysis || {}
    
    return {
      totalCommands: analysis.totalCommands || 0,
      activeDays: analysis.timeAnalysis?.activeDays || 0,
      uniqueCommands: analysis.commandAnalysis?.uniqueCommandsCount || 0,
      topCommands: analysis.commandAnalysis?.topMainCommands || {},
      shells: analysis.shells || {},
      timePatterns: analysis.timeAnalysis || {},
      generatedAt: analysis.generatedAt || new Date().toISOString()
    }
  }

  /**
   * 处理时间范围统计数据
   * @param {Object} rawData - 原始数据
   * @returns {Object} 处理后的数据
   */
  processTimeRangeStats(rawData) {
    return {
      timeRange: rawData.timeRange,
      totalCount: rawData.totalCount || 0,
      periodStats: {
        uniqueCommands: rawData.periodStats?.uniqueCommands || 0
      },
      activeDays: rawData.activeDays || 0,
      chartData: rawData.chartData || { labels: [], data: [] },
      topCommands: rawData.topCommands || {},
      startDate: rawData.startDate,
      endDate: rawData.endDate,
      generatedAt: rawData.generatedAt || new Date().toISOString()
    }
  }

  /**
   * 清除缓存
   * @param {string} type - 缓存类型 ('all', 'stats', 'timeRange', 'yearly', 'heatmap')
   */
  clearCache(type = 'all') {
    console.log(`Clearing cache: ${type}`)
    
    switch (type) {
      case 'all':
        dataCache.value.statsOnly = null
        dataCache.value.timeRangeStats.clear()
        dataCache.value.yearlyData.clear()
        dataCache.value.heatmapData.clear()
        dataCache.value.availableYears = null
        break
      case 'stats':
        dataCache.value.statsOnly = null
        break
      case 'timeRange':
        dataCache.value.timeRangeStats.clear()
        break
      case 'yearly':
        dataCache.value.yearlyData.clear()
        break
      case 'heatmap':
        dataCache.value.heatmapData.clear()
        break
    }
  }

  /**
   * 强制刷新所有数据
   * @returns {Promise<void>}
   */
  async refreshAll() {
    console.log('Force refreshing all data...')
    this.clearCache('all')
    
    try {
      // 强制刷新后端缓存
      await window.electron.ipcRenderer.invoke('refresh-shell-history')
      console.log('All data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      throw error
    }
  }
}

// 创建单例实例
export const dataService = new DataService()

// 导出便捷方法
export const useDataService = () => {
  return {
    dataService,
    isLoading: dataService.isLoading,
    error: dataService.error
  }
}
