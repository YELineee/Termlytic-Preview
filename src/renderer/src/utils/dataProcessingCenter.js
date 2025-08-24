/**
 * Data Processing Center - Optimize data aggregation and computation workflow
 * Avoid duplicate data processing, calculate multi-purpose results in one pass
 * Now integrated with global data management, eliminating duplicate IPC calls
 */
import { useShellData } from '../composables/useShellData.js'

class DataProcessingCenter {
  constructor() {
    this.cache = new Map()
    this.cacheTimestamp = 0
    this.cacheExpiry = 5 * 60 * 1000 // 5 minute cache
    
    // Use global data management
    this.shellDataManager = null
  }

  /**
   * Initialize data manager
   */
  initializeDataManager() {
    if (!this.shellDataManager) {
      this.shellDataManager = useShellData()
    }
    return this.shellDataManager
  }

  /**
   * Get processed data using global cache mechanism
   */
  async getProcessedData(forceRefresh = false) {
    const now = Date.now()

    // Check if local cache is valid
    if (
      !forceRefresh &&
      this.cache.has('processedData') &&
      now - this.cacheTimestamp < this.cacheExpiry
    ) {
      console.log('Using DataProcessingCenter cache')
      return this.cache.get('processedData')
    }

    try {
      // Use global data manager to avoid duplicate IPC calls
      const dataManager = this.initializeDataManager()
      const result = await dataManager.getShellHistory(forceRefresh)

      if (!result.success || !result.entries) {
        throw new Error('Failed to fetch shell history from global manager')
      }

      // Process all statistics data in one pass
      const processedData = this.processAllStats(result.entries)

      // Update cache
      this.cache.set('processedData', processedData)
      this.cacheTimestamp = now

      console.log('DataProcessingCenter: processed data updated')
      return processedData
    } catch (error) {
      console.error('Failed to process data:', error)
      throw error
    }
  }

  /**
   * Process all statistics data in one pass
   */
  processAllStats(entries) {
    const stats = {
      total: entries.length,
      hourly: Array(24).fill(0),
      weekly: Array(7).fill(0),
      daily: {},
      commands: {},
      shells: {},
      timeline: []
    }

    // Process all statistics in a single traversal
    entries.forEach((entry) => {
      if (!entry.timestamp) return

      const date = new Date(entry.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const dateKey = date.toISOString().split('T')[0]

      // Hour statistics
      stats.hourly[hour]++

      // Day of week statistics
      stats.weekly[dayOfWeek]++

      // Daily statistics
      stats.daily[dateKey] = (stats.daily[dateKey] || 0) + 1

      // Command statistics
      if (entry.command) {
        const mainCommand = entry.command.split(' ')[0]
        stats.commands[mainCommand] = (stats.commands[mainCommand] || 0) + 1
      }

      // Terminal statistics
      if (entry.shell) {
        stats.shells[entry.shell] = (stats.shells[entry.shell] || 0) + 1
      }

      // Timeline data (for trend analysis)
      stats.timeline.push({
        date: dateKey,
        timestamp: entry.timestamp,
        command: entry.command,
        shell: entry.shell
      })
    })

    // Calculate derived statistics
    return this.calculateDerivedStats(stats)
  }

  /**
   * Calculate derived statistics data
   */
  calculateDerivedStats(stats) {
    // Today's statistics
    const today = new Date().toISOString().split('T')[0]
    const todayCommands = stats.daily[today] || 0

    // Extreme value statistics
    const dailyValues = Object.values(stats.daily)
    const maxDailyCommands = Math.max(...dailyValues, 0)
    const minDailyCommands = Math.min(...dailyValues, 0)

    const laziestDay = Object.entries(stats.daily).reduce(
      (min, [date, count]) => (count < min.count ? { count, date } : min),
      { count: Infinity, date: '' }
    )

    const craziestDay = Object.entries(stats.daily).reduce(
      (max, [date, count]) => (count > max.count ? { count, date } : max),
      { count: 0, date: '' }
    )

    // Consecutive active days
    const longestStreak = this.calculateLongestStreak(Object.keys(stats.daily))

    // Top commands
    const topCommands = Object.entries(stats.commands)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Terminal distribution
    const totalShellCommands = Object.values(stats.shells).reduce((sum, count) => sum + count, 0)
    const shellDistribution = Object.entries(stats.shells).map(([shell, count]) => ({
      shell,
      count,
      percentage: (count / totalShellCommands) * 100
    }))

    // Active days
    const activeDays = Object.keys(stats.daily).length

    // Average daily commands
    const averageDaily = activeDays > 0 ? Math.round(stats.total / activeDays) : 0

    // Most active hour
    const mostActiveHour = stats.hourly.indexOf(Math.max(...stats.hourly))

    // Most active day of week
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mostActiveDay = dayNames[stats.weekly.indexOf(Math.max(...stats.weekly))]

    return {
      // Raw statistics
      ...stats,

      // Derived statistics
      today: {
        commands: todayCommands,
        date: today
      },

      extremes: {
        laziest: {
          count: laziestDay.count === Infinity ? 0 : laziestDay.count,
          date: laziestDay.date
        },
        craziest: {
          count: craziestDay.count,
          date: craziestDay.date
        },
        longestStreak
      },

      topCommands,
      shellDistribution,

      summary: {
        totalCommands: stats.total,
        activeDays,
        averageDaily,
        uniqueCommands: Object.keys(stats.commands).length,
        mostActiveHour,
        mostActiveDay
      }
    }
  }

  /**
   * Calculate longest consecutive active days
   */
  calculateLongestStreak(dates) {
    const sortedDates = dates.sort()
    if (sortedDates.length === 0) return 0

    let maxStreak = 0
    let currentStreak = 0
    let lastDate = null

    sortedDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr)

      if (lastDate) {
        const daysDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24)
        if (daysDiff === 1) {
          currentStreak++
        } else {
          maxStreak = Math.max(maxStreak, currentStreak)
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }

      lastDate = currentDate
    })

    return Math.max(maxStreak, currentStreak)
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
    this.cacheTimestamp = 0
  }

  /**
   * Get specific type of statistics data - optimized version, prioritizing lightweight data
   */
  async getSpecificStats(type, forceRefresh = false) {
    const dataManager = this.initializeDataManager()

    // For statistical data, prioritize lightweight interface
    if (['hourly', 'daily', 'commands', 'shells', 'summary'].includes(type)) {
      try {
        const statsOnlyData = await dataManager.getStatsOnly(forceRefresh)
        
        if (statsOnlyData?.analysis) {
          const analysis = statsOnlyData.analysis
          
          switch (type) {
            case 'hourly':
              const hourlyData = analysis.timeAnalysis?.hourlyDistribution || analysis.timeAnalysis?.hourlyActivity || {}
              // Convert to component expected format
              let hourlyArray = Array(24).fill(0)
              
              if (Array.isArray(hourlyData)) {
                // If already in array format
                hourlyArray = hourlyData.slice(0, 24)
                while (hourlyArray.length < 24) hourlyArray.push(0)
              } else if (typeof hourlyData === 'object') {
                // If in object format, convert to array
                Object.entries(hourlyData).forEach(([hour, count]) => {
                  const hourIndex = parseInt(hour)
                  if (hourIndex >= 0 && hourIndex < 24) {
                    hourlyArray[hourIndex] = count || 0
                  }
                })
              }
              
              // Calculate most active hour
              const maxCount = Math.max(...hourlyArray)
              const mostActiveHour = hourlyArray.indexOf(maxCount)
              
              return {
                data: hourlyArray,
                mostActive: mostActiveHour,
                total: analysis.totalCommands || 0
              }
              
            case 'daily':
              return {
                today: analysis.timeAnalysis?.todayCommands || 0,
                total: analysis.totalCommands || 0,
                average: analysis.timeAnalysis?.averageDaily || 0
              }
              
            case 'commands':
              return analysis.commandAnalysis?.topMainCommands || {}
              
            case 'shells':
              return analysis.shells || {}
              
            case 'summary':
              return {
                totalCommands: analysis.totalCommands || 0,
                activeDays: analysis.timeAnalysis?.activeDays || 0,
                uniqueCommands: analysis.commandAnalysis?.uniqueCommandsCount || 0
              }
          }
        }
      } catch (error) {
        console.warn(`Failed to get ${type} stats from lightweight data, falling back to full data:`, error)
      }
    }

    // Fall back to full data processing
    const data = await this.getProcessedData(forceRefresh)

    switch (type) {
      case 'hourly':
        return {
          data: data.hourly,
          mostActive: data.summary.mostActiveHour,
          total: data.summary.totalCommands
        }

      case 'weekly':
        return {
          data: data.weekly,
          mostActive: data.summary.mostActiveDay,
          total: data.summary.totalCommands
        }

      case 'daily':
        return {
          today: data.today,
          total: data.summary.totalCommands,
          average: data.summary.averageDaily
        }

      case 'extremes':
        return data.extremes

      case 'commands':
        return data.topCommands

      case 'shells':
        return data.shellDistribution

      case 'summary':
        return data.summary

      default:
        return data
    }
  }
}

// Create singleton instance
const dataCenter = new DataProcessingCenter()

export default dataCenter
