/**
 * Unified data service module
 * Provides standardized data retrieval interfaces, handles all component data needs uniformly
 * Solves issues with inconsistent data structures and duplicate requests
 */

import { ref, computed } from 'vue'

// Global data cache
const dataCache = ref({
  shellHistory: null,
  statsOnly: null,
  timeRangeStats: new Map(), // Cache statistics data by time range
  yearlyData: new Map(), // Cache data by year
  heatmapData: new Map(), // Cache heatmap data by year
  availableYears: null,
  lastUpdate: null,
  loading: false,
  error: null
})

// Cache time configuration (milliseconds)
const CACHE_CONFIG = {
  stats: 10 * 60 * 1000, // Statistics data: 10 minutes
  timeRange: 5 * 60 * 1000, // Time range data: 5 minutes
  yearly: 15 * 60 * 1000, // Yearly data: 15 minutes
  heatmap: 10 * 60 * 1000, // Heatmap data: 10 minutes
  years: 30 * 60 * 1000 // Available years: 30 minutes
}

/**
 * Check if cache is valid
 * @param {number} timestamp - Cache timestamp
 * @param {number} duration - Cache duration
 * @returns {boolean} Whether cache is valid
 */
function isCacheValid(timestamp, duration) {
  if (!timestamp) return false
  return Date.now() - timestamp < duration
}

/**
 * Unified data service class
 */
export class DataService {
  constructor() {
    this.isLoading = computed(() => dataCache.value.loading)
    this.error = computed(() => dataCache.value.error)
  }

  /**
   * Get basic statistics data
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise<Object>} Statistics data
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
   * Get time range statistics data
   * @param {string} timeRange - Time range ('day', 'week', 'month', 'year')
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise<Object>} Time range statistics data
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
      const result = await window.electron.ipcRenderer.invoke('get-time-range-stats', timeRange, forceRefresh)

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
   * Get available years list
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise<Array>} Available years array
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
   * Get yearly heatmap data
   * @param {number} year - Year
   * @param {string} shellTypes - Shell types
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise<Object>} Heatmap data
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
      const result = await window.electron.ipcRenderer.invoke('get-yearly-heatmap-data', year, shellTypes, forceRefresh)

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
   * Generate command ticket data
   * @param {number} year - Year
   * @param {boolean} forceRefresh - Whether to force refresh
   * @returns {Promise<Object>} Ticket data
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
   * Process basic statistics data
   * @param {Object} rawData - Raw data
   * @returns {Object} Processed data
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
   * Process time range statistics data
   * @param {Object} rawData - Raw data
   * @returns {Object} Processed data
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
   * Clear cache
   * @param {string} type - Cache type ('all', 'stats', 'timeRange', 'yearly', 'heatmap')
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
   * Force refresh all data
   * @returns {Promise<void>}
   */
  async refreshAll() {
    console.log('Force refreshing all data...')
    this.clearCache('all')
    
    try {
      // Force refresh backend cache
      await window.electron.ipcRenderer.invoke('refresh-shell-history')
      console.log('All data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing data:', error)
      throw error
    }
  }
}

// Create singleton instance
export const dataService = new DataService()

// Export convenience methods
export const useDataService = () => {
  return {
    dataService,
    isLoading: dataService.isLoading,
    error: dataService.error
  }
}
