/**
 * Data Processing Center - Optimize data aggregation and computation workflow
 * 避免重复数据处理，一次计算多用途结果
 * 现已集成全局数据管理，消除重复IPC调用
 */
import { useShellData } from '../composables/useShellData.js'

class DataProcessingCenter {
  constructor() {
    this.cache = new Map()
    this.cacheTimestamp = 0
    this.cacheExpiry = 5 * 60 * 1000 // 5分钟缓存
    
    // 使用全局数据管理
    this.shellDataManager = null
  }

  /**
   * 初始化数据管理器
   */
  initializeDataManager() {
    if (!this.shellDataManager) {
      this.shellDataManager = useShellData()
    }
    return this.shellDataManager
  }

  /**
   * 获取处理过的数据，使用全局缓存机制
   */
  async getProcessedData(forceRefresh = false) {
    const now = Date.now()

    // 检查本地缓存是否有效
    if (
      !forceRefresh &&
      this.cache.has('processedData') &&
      now - this.cacheTimestamp < this.cacheExpiry
    ) {
      console.log('Using DataProcessingCenter cache')
      return this.cache.get('processedData')
    }

    try {
      // 使用全局数据管理器，避免重复IPC调用
      const dataManager = this.initializeDataManager()
      const result = await dataManager.getShellHistory(forceRefresh)

      if (!result.success || !result.entries) {
        throw new Error('Failed to fetch shell history from global manager')
      }

      // 一次性处理所有统计数据
      const processedData = this.processAllStats(result.entries)

      // 更新缓存
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
   * 一次性处理所有统计数据
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

    // 单次遍历处理所有统计
    entries.forEach((entry) => {
      if (!entry.timestamp) return

      const date = new Date(entry.timestamp)
      const hour = date.getHours()
      const dayOfWeek = date.getDay()
      const dateKey = date.toISOString().split('T')[0]

      // 小时统计
      stats.hourly[hour]++

      // 星期统计
      stats.weekly[dayOfWeek]++

      // 每日统计
      stats.daily[dateKey] = (stats.daily[dateKey] || 0) + 1

      // 命令统计
      if (entry.command) {
        const mainCommand = entry.command.split(' ')[0]
        stats.commands[mainCommand] = (stats.commands[mainCommand] || 0) + 1
      }

      // 终端统计
      if (entry.shell) {
        stats.shells[entry.shell] = (stats.shells[entry.shell] || 0) + 1
      }

      // 时间线数据（用于趋势分析）
      stats.timeline.push({
        date: dateKey,
        timestamp: entry.timestamp,
        command: entry.command,
        shell: entry.shell
      })
    })

    // 计算衍生统计
    return this.calculateDerivedStats(stats)
  }

  /**
   * 计算衍生统计数据
   */
  calculateDerivedStats(stats) {
    // 今日统计
    const today = new Date().toISOString().split('T')[0]
    const todayCommands = stats.daily[today] || 0

    // 极值统计
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

    // 连续活跃天数
    const longestStreak = this.calculateLongestStreak(Object.keys(stats.daily))

    // Top 命令
    const topCommands = Object.entries(stats.commands)
      .map(([command, count]) => ({ command, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // 终端分布
    const totalShellCommands = Object.values(stats.shells).reduce((sum, count) => sum + count, 0)
    const shellDistribution = Object.entries(stats.shells).map(([shell, count]) => ({
      shell,
      count,
      percentage: (count / totalShellCommands) * 100
    }))

    // 活跃天数
    const activeDays = Object.keys(stats.daily).length

    // 平均每日命令数
    const averageDaily = activeDays > 0 ? Math.round(stats.total / activeDays) : 0

    // 最活跃小时
    const mostActiveHour = stats.hourly.indexOf(Math.max(...stats.hourly))

    // 最活跃星期
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const mostActiveDay = dayNames[stats.weekly.indexOf(Math.max(...stats.weekly))]

    return {
      // 原始统计
      ...stats,

      // 衍生统计
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
   * 计算最长连续活跃天数
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
   * 清除缓存
   */
  clearCache() {
    this.cache.clear()
    this.cacheTimestamp = 0
  }

  /**
   * 获取特定类型的统计数据 - 优化版本，优先使用轻量级数据
   */
  async getSpecificStats(type, forceRefresh = false) {
    const dataManager = this.initializeDataManager()

    // 对于统计类数据，优先尝试轻量级接口
    if (['hourly', 'daily', 'commands', 'shells', 'summary'].includes(type)) {
      try {
        const statsOnlyData = await dataManager.getStatsOnly(forceRefresh)
        
        if (statsOnlyData?.analysis) {
          const analysis = statsOnlyData.analysis
          
          switch (type) {
            case 'hourly':
              const hourlyData = analysis.timeAnalysis?.hourlyDistribution || analysis.timeAnalysis?.hourlyActivity || {}
              // 转换为组件期望的格式
              let hourlyArray = Array(24).fill(0)
              
              if (Array.isArray(hourlyData)) {
                // 如果已经是数组格式
                hourlyArray = hourlyData.slice(0, 24)
                while (hourlyArray.length < 24) hourlyArray.push(0)
              } else if (typeof hourlyData === 'object') {
                // 如果是对象格式，转换为数组
                Object.entries(hourlyData).forEach(([hour, count]) => {
                  const hourIndex = parseInt(hour)
                  if (hourIndex >= 0 && hourIndex < 24) {
                    hourlyArray[hourIndex] = count || 0
                  }
                })
              }
              
              // 计算最活跃的小时
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

    // 回退到完整数据处理
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

// 创建单例实例
const dataCenter = new DataProcessingCenter()

export default dataCenter
