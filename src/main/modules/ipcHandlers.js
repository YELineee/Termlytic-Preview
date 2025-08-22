/**
 * IPC 处理器模块
 * 负责处理渲染进程与主进程之间的通信
 * 提供 Shell 历史记录分析相关的 API
 */

import { ipcMain } from 'electron'
import { ShellHistoryAnalyzer } from '../services/shellHistoryAnalyzer.js'

/**
 * IPC 处理器类
 * 管理所有与 Shell 历史记录相关的 IPC 通信
 */


export class IPCHandlers {
  constructor() {
    this.analyzer = new ShellHistoryAnalyzer()
    this.setupHandlers()
    console.log('IPC handlers initialized')
  }

  /**
   * 设置所有 IPC 处理器
   */
  setupHandlers() {
    // 获取轻量级统计数据 (仅统计，不含原始数据)
    ipcMain.handle('get-shell-stats-only', async () => {
      return await this.handleGetShellStatsOnly()
    })

    // 获取分页历史记录
    ipcMain.handle('get-shell-history-page', async (event, page = 0, limit = 100) => {
      return await this.handleGetShellHistoryPage(page, limit)
    })

    // 获取轻量级统计数据
    ipcMain.handle('get-shell-stats', async () => {
      return await this.handleGetShellStats()
    })

    // 获取 Shell 历史记录分析结果 (完整数据)
    ipcMain.handle('get-shell-history', async () => {
      return await this.handleGetShellHistory()
    })

    // 强制刷新数据
    ipcMain.handle('refresh-shell-history', async () => {
      return await this.handleRefreshShellHistory()
    })

    // 获取缓存信息
    ipcMain.handle('get-cache-info', async () => {
      return await this.handleGetCacheInfo()
    })

    // Clear cache
    ipcMain.handle('clear-cache', async () => {
      return await this.handleClearCache()
    })

    // 获取时间范围统计数据
    ipcMain.handle('get-time-range-stats', async (event, timeRange) => {
      return await this.handleGetTimeRangeStats(timeRange)
    })

    // 获取年份热力图数据
    ipcMain.handle('get-yearly-heatmap-data', async (event, year, shellTypes = 'all') => {
      return await this.handleGetYearlyHeatmapData(year, shellTypes)
    })

    // 获取可用年份列表
    ipcMain.handle('get-available-years', async () => {
      return await this.handleGetAvailableYears()
    })

    // 获取可用的 Shell 列表
    ipcMain.handle('get-available-shells', async () => {
      return await this.handleGetAvailableShells()
    })

    // 获取文件状态信息
    ipcMain.handle('get-file-status', async () => {
      return await this.handleGetFileStatus()
    })

    // 获取特定日期的命令记录
    ipcMain.handle('get-date-commands', async (event, date, shellTypes = 'all') => {
      return await this.handleGetDateCommands(date, shellTypes)
    })

    // 生成命令票据
    ipcMain.handle('generate-command-ticket', async (event, year, options = {}) => {
      return await this.handleGenerateCommandTicket(year, options)
    })

    // 诊断 shell 历史配置
    ipcMain.handle('diagnose-shell-history', async () => {
      return await this.handleDiagnoseShellHistory()
    })

    console.log('All IPC handlers registered')
  }

  /**
   * 处理获取轻量级统计数据的请求 (仅统计，不含原始数据)
   * @returns {Object} 轻量级统计结果
   */
  async handleGetShellStatsOnly() {
    try {
      console.log('IPC: get-shell-stats-only requested')
      const startTime = Date.now()

      // 只获取分析结果，不返回原始entries
      const result = await this.analyzer.analyzeShellHistory()
      
      // 构建轻量级响应 (不包含entries)
      const lightResponse = {
        success: true,
        analysis: result.analysis,
        metadata: result.metadata,
        // 不包含 entries 数组，大幅减少数据传输
        processingTimeMs: Date.now() - startTime
      }

      console.log(`IPC: get-shell-stats-only completed in ${lightResponse.processingTimeMs}ms`)
      return lightResponse
    } catch (err) {
      console.error('IPC: get-shell-stats-only failed:', err)
      return {
        success: false,
        error: err.message,
        analysis: null
      }
    }
  }

  /**
   * 处理分页获取历史记录的请求
   * @param {number} page - 页码 (从0开始)
   * @param {number} limit - 每页条数
   * @returns {Object} 分页历史记录
   */
  async handleGetShellHistoryPage(page = 0, limit = 100) {
    try {
      console.log(`IPC: get-shell-history-page requested (page=${page}, limit=${limit})`)
      const startTime = Date.now()

      const result = await this.analyzer.analyzeShellHistory()
      
      if (!result.success || !result.entries) {
        return {
          success: false,
          error: 'Failed to get shell history',
          entries: [],
          pagination: { page, limit, total: 0, hasMore: false }
        }
      }

      // 分页处理
      const startIndex = page * limit
      const endIndex = startIndex + limit
      const paginatedEntries = result.entries.slice(startIndex, endIndex)
      
      const response = {
        success: true,
        entries: paginatedEntries,
        pagination: {
          page,
          limit,
          total: result.entries.length,
          hasMore: endIndex < result.entries.length,
          totalPages: Math.ceil(result.entries.length / limit)
        },
        // 只在第一页时包含分析数据
        analysis: page === 0 ? result.analysis : null,
        metadata: result.metadata,
        processingTimeMs: Date.now() - startTime
      }

      console.log(`IPC: get-shell-history-page completed in ${response.processingTimeMs}ms, returned ${paginatedEntries.length} entries`)
      return response
    } catch (err) {
      console.error('IPC: get-shell-history-page failed:', err)
      return {
        success: false,
        error: err.message,
        entries: [],
        pagination: { page, limit, total: 0, hasMore: false }
      }
    }
  }

  /**
   * 处理获取 Shell 历史记录的请求
   * @returns {Object} 历史记录分析结果
   */
  async handleGetShellHistory() {
    try {
      console.log('IPC: get-shell-history requested')
      const startTime = Date.now()

      const result = await this.analyzer.analyzeShellHistory()

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: get-shell-history completed in ${processingTime}ms`)

      return {
        ...result,
        processingTimeMs: processingTime,
        success: true
      }
    } catch (err) {
      console.error('IPC: get-shell-history failed:', err)

      return {
        success: false,
        error: err.message,
        entries: [],
        analysis: null
      }
    }
  }

  /**
   * 处理强制刷新请求
   * @returns {Object} 刷新后的分析结果
   */
  async handleRefreshShellHistory() {
    try {
      console.log('IPC: refresh-shell-history requested')
      const startTime = Date.now()

      const result = await this.analyzer.forceRefresh()

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: refresh-shell-history completed in ${processingTime}ms`)

      return {
        ...result,
        processingTimeMs: processingTime,
        success: true,
        refreshed: true
      }
    } catch (err) {
      console.error('IPC: refresh-shell-history failed:', err)

      return {
        success: false,
        error: err.message,
        refreshed: false
      }
    }
  }

  /**
   * 处理获取缓存信息的请求
   * @returns {Object} 缓存状态信息
   */
  async handleGetCacheInfo() {
    try {
      console.log('IPC: get-cache-info requested')

      const cacheInfo = await this.analyzer.getCacheInfo()

      console.log('IPC: get-cache-info completed successfully')
      return {
        success: true,
        ...cacheInfo
      }
    } catch (err) {
      console.error('IPC: get-cache-info failed:', err)

      return {
        success: false,
        error: err.message,
        hasCache: false,
        entries: 0,
        size: 0
      }
    }
  }

  /**
   * 处理清除缓存的请求
   * @returns {Object} 清除结果
   */
  async handleClearCache() {
    try {
      console.log('IPC: clear-cache requested')

      const result = await this.analyzer.clearCache()

      console.log('IPC: clear-cache completed successfully')
      return {
        success: true,
        message: '缓存已清除',
        ...result
      }
    } catch (err) {
      console.error('IPC: clear-cache failed:', err)

      return {
        success: false,
        error: err.message
      }
    }
  }

  /**
   * 处理获取可用 Shell 列表的请求
   * @returns {Object} 可用的 Shell 信息
   */
  async handleGetAvailableShells() {
    try {
      console.log('IPC: get-available-shells requested')

      const availableShells = await this.analyzer.fileReader.detectAvailableShells()

      return {
        success: true,
        shells: availableShells,
        count: availableShells.length
      }
    } catch (err) {
      console.error('IPC: get-available-shells failed:', err)

      return {
        success: false,
        error: err.message,
        shells: [],
        count: 0
      }
    }
  }

  /**
   * 处理获取文件状态信息的请求
   * @returns {Object} 文件状态信息
   */
  async handleGetFileStatus() {
    try {
      console.log('IPC: get-file-status requested')

      const fileStatus = await this.analyzer.fileReader.getAllFileStatus()

      return {
        success: true,
        files: fileStatus
      }
    } catch (err) {
      console.error('IPC: get-file-status failed:', err)

      return {
        success: false,
        error: err.message,
        files: {}
      }
    }
  }

  /**
   * 处理获取时间范围统计数据的请求
   * @param {string} timeRange - 时间范围 ('day', 'week', 'month', 'year')
   * @returns {Object} 时间范围统计数据
   */
  async handleGetTimeRangeStats(timeRange) {
    try {
      console.log(`IPC: get-time-range-stats requested for ${timeRange}`)

      const startTime = Date.now()

      // 获取完整的历史数据
      const fullData = await this.analyzer.analyzeShellHistory()

      // 根据时间范围过滤和聚合数据
      const rangeStats = this.analyzer.dataAnalyzer.getTimeRangeStatistics(fullData.entries || [], timeRange)

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: get-time-range-stats (${timeRange}) completed in ${processingTime}ms`)

      return {
        success: true,
        timeRange,
        data: rangeStats,
        processingTimeMs: processingTime
      }
    } catch (err) {
      console.error(`IPC: get-time-range-stats (${timeRange}) failed:`, err)

      return {
        success: false,
        timeRange,
        error: err.message,
        data: null
      }
    }
  }

  /**
   * 处理获取年份热力图数据的请求
   * @param {number} year - 年份
   * @param {string|string[]} shellTypes - 终端类型 ('all', 'bash', 'zsh', ['bash', 'zsh'])
   * @returns {Object} 年份热力图数据
   */
  async handleGetYearlyHeatmapData(year, shellTypes = 'all') {
    try {
      console.log(
        `IPC: get-yearly-heatmap-data requested for year ${year}, shellTypes: ${shellTypes}`
      )

      const startTime = Date.now()

      // 获取完整的历史数据
      const fullData = await this.analyzer.analyzeShellHistory()

      // 生成指定年份的热力图数据
      const heatmapData = this.generateYearlyHeatmapData(fullData, year, shellTypes)

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(
        `IPC: get-yearly-heatmap-data (${year}, ${shellTypes}) completed in ${processingTime}ms`
      )

      return {
        success: true,
        year,
        shellTypes,
        data: heatmapData,
        processingTimeMs: processingTime
      }
    } catch (err) {
      console.error(`IPC: get-yearly-heatmap-data (${year}, ${shellTypes}) failed:`, err)

      return {
        success: false,
        year,
        shellTypes,
        error: err.message,
        data: {}
      }
    }
  }

  /**
   * 处理获取可用年份列表的请求
   * @returns {Object} 可用年份列表
   */
  async handleGetAvailableYears() {
    try {
      console.log('IPC: get-available-years requested')

      const startTime = Date.now()

      // 获取完整的历史数据
      const fullData = await this.analyzer.analyzeShellHistory()

      // 提取所有可用年份
      const years = this.extractAvailableYears(fullData)

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(
        `IPC: get-available-years completed in ${processingTime}ms, found years: ${years.join(
          ', '
        )}`
      )

      return {
        success: true,
        data: years,
        processingTimeMs: processingTime
      }
    } catch (err) {
      console.error('IPC: get-available-years failed:', err)

      return {
        success: false,
        error: err.message,
        data: []
      }
    }
  }

  /**
   * 生成指定年份的热力图数据
   * @param {Object} fullData - 完整的历史数据
   * @param {number} year - 年份
   * @param {string|string[]} shellTypes - 终端类型过滤 ('all', 'bash', 'zsh', ['bash', 'zsh'])
   * @returns {Array} ECharts 热力图数据，格式为 [['2024-01-01', 5], ...]
   */
  generateYearlyHeatmapData(fullData, year, shellTypes = 'all') {
    console.log(`Generating ECharts heatmap data for year ${year}, shellTypes: ${shellTypes}`)
    console.log(`Total entries received: ${fullData.entries?.length || 0}`)

    const entries = fullData.entries || []

    // 调试：检查条目的时间戳格式
    if (entries.length > 0) {
      console.log(`Sample entry timestamps:`)
      entries.slice(0, 5).forEach((entry, i) => {
        console.log(
          `  Entry ${i}: timestamp=${entry.timestamp}, type=${typeof entry.timestamp}, date=${
            entry.timestamp ? new Date(entry.timestamp) : 'invalid'
          }`
        )
      })
    }

    // 过滤指定年份的数据
    let yearEntries = entries.filter((entry) => {
      if (!entry.timestamp) return false

      try {
        // 处理不同格式的时间戳
        let date
        if (typeof entry.timestamp === 'number') {
          // Unix 时间戳（秒或毫秒）
          date = new Date(entry.timestamp > 1e10 ? entry.timestamp : entry.timestamp * 1000)
        } else if (typeof entry.timestamp === 'string') {
          date = new Date(entry.timestamp)
        } else if (entry.timestamp instanceof Date) {
          date = entry.timestamp
        } else {
          return false
        }

        if (isNaN(date.getTime())) return false

        const entryYear = date.getFullYear()
        return entryYear === year
      } catch (err) {
        console.warn(`Invalid timestamp format:`, entry.timestamp)
        return false
      }
    })

    console.log(`After year filtering (${year}): ${yearEntries.length} entries`)

    // 根据终端类型过滤数据
    if (shellTypes !== 'all') {
      const targetShells = Array.isArray(shellTypes) ? shellTypes : [shellTypes]
      yearEntries = yearEntries.filter((entry) => {
        return entry.shell && targetShells.includes(entry.shell)
      })
      console.log(
        `After shell filtering (${targetShells.join(', ')}): ${yearEntries.length} entries`
      )
    }

    // 按日期聚合数据
    const dailyCounts = {}
    let validEntriesCount = 0

    yearEntries.forEach((entry) => {
      try {
        let date
        if (typeof entry.timestamp === 'number') {
          date = new Date(entry.timestamp > 1e10 ? entry.timestamp : entry.timestamp * 1000)
        } else if (typeof entry.timestamp === 'string') {
          date = new Date(entry.timestamp)
        } else if (entry.timestamp instanceof Date) {
          date = entry.timestamp
        } else {
          return
        }

        if (isNaN(date.getTime())) return

        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD 格式

        if (!dailyCounts[dateKey]) {
          dailyCounts[dateKey] = 0
        }
        dailyCounts[dateKey]++
        validEntriesCount++
      } catch (err) {
        console.warn(`Error processing timestamp:`, entry.timestamp, err)
      }
    })

    console.log(`Successfully processed ${validEntriesCount} entries into daily counts`)
    console.log(`Days with activity: ${Object.keys(dailyCounts).length}`)

    // 生成一年的所有日期并填充数据（ECharts 格式）
    const startDate = new Date(year, 0, 1) // 年初
    const endDate = new Date(year, 11, 31) // 年末
    const heatmapData = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0] // YYYY-MM-DD 格式
      const count = dailyCounts[dateKey] || 0
      heatmapData.push([dateKey, count])
    }

    // 统计信息
    const totalCommands = heatmapData.reduce((sum, [, count]) => sum + count, 0)
    const activeDays = heatmapData.filter(([, count]) => count > 0).length

    console.log(`Generated ECharts heatmap data with ${heatmapData.length} days`)
    console.log(`  - Total commands: ${totalCommands}`)
    console.log(`  - Active days: ${activeDays}`)
    console.log(`  - Max daily commands: ${Math.max(...heatmapData.map(([, count]) => count))}`)

    return heatmapData
  }

  /**
   * 处理获取特定日期命令记录的请求
   * @param {string} date - 日期字符串 (YYYY-MM-DD)
   * @param {string|string[]} shellTypes - 终端类型过滤
   * @returns {Object} 指定日期的命令记录
   */
  async handleGetDateCommands(date, shellTypes = 'all') {
    try {
      console.log(`IPC: get-date-commands requested for ${date}, shellTypes: ${shellTypes}`)

      const startTime = Date.now()

      // 获取完整的历史数据
      const fullData = await this.analyzer.analyzeShellHistory()
      const entries = fullData.entries || []

      // 解析目标日期
      const targetDate = new Date(date)
      if (isNaN(targetDate.getTime())) {
        throw new Error(`Invalid date format: ${date}`)
      }

      // 设置日期范围（当天的开始和结束）
      const dayStart = new Date(targetDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(targetDate)
      dayEnd.setHours(23, 59, 59, 999)

      // 过滤指定日期的命令
      let dateEntries = entries.filter((entry) => {
        if (!entry.timestamp) return false

        try {
          let entryDate
          if (typeof entry.timestamp === 'number') {
            entryDate = new Date(entry.timestamp > 1e10 ? entry.timestamp : entry.timestamp * 1000)
          } else if (typeof entry.timestamp === 'string') {
            entryDate = new Date(entry.timestamp)
          } else if (entry.timestamp instanceof Date) {
            entryDate = entry.timestamp
          } else {
            return false
          }

          if (isNaN(entryDate.getTime())) return false

          return entryDate >= dayStart && entryDate <= dayEnd
        } catch (err) {
          console.warn(`Error processing timestamp:`, entry.timestamp)
          return false
        }
      })

      // 根据终端类型过滤
      if (shellTypes !== 'all') {
        const targetShells = Array.isArray(shellTypes) ? shellTypes : [shellTypes]
        dateEntries = dateEntries.filter((entry) => {
          return entry.shell && targetShells.includes(entry.shell)
        })
      }

      // 转换为前端期望的格式
      const commands = dateEntries.map((entry) => ({
        command: entry.commandInfo?.full || entry.command || '',
        timestamp: entry.timestamp,
        shell_type: entry.shell || 'unknown'
      }))

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: get-date-commands (${date}) completed in ${processingTime}ms`)
      console.log(`Found ${commands.length} commands for ${date}`)

      return {
        success: true,
        date,
        shellTypes,
        data: commands,
        totalCount: commands.length,
        processingTimeMs: processingTime
      }
    } catch (err) {
      console.error(`IPC: get-date-commands (${date}) failed:`, err)

      return {
        success: false,
        date,
        shellTypes,
        error: err.message,
        data: [],
        totalCount: 0
      }
    }
  }

  /**
   * 处理生成命令票据的请求
   * @param {number} year - 年份
   * @param {Object} options - 生成选项
   * @returns {Object} 完整的票据数据
   */
  async handleGenerateCommandTicket(year, options = {}) {
    try {
      console.log(`IPC: generate-command-ticket requested for year ${year}`)
      const startTime = Date.now()

      // 1. 获取完整的历史数据
      const fullData = await this.analyzer.analyzeShellHistory()
      
      // 2. 生成热力图数据
      const heatmapData = this.generateYearlyHeatmapData(fullData, year, 'all')
      
      // 3. 转换为HeatmapWrapper所需的格式
      const heatmapWrapperData = this.convertToHeatmapWrapperFormat(heatmapData)
      
      // 4. 计算基础统计信息
      const totalCommands = heatmapData.reduce((sum, [, count]) => sum + count, 0)
      const activeDays = heatmapData.filter(([, count]) => count > 0).length
      
      // 5. 生成图表数据（月度统计）
      const chartData = this.generateMonthlyChartData(heatmapData)
      
      // 6. 获取顶级命令和其他统计
      const topCommand = this.getTopCommand(fullData, year)
      const shellCount = Object.keys(fullData.analysis?.shells || {}).length
      
      // 7. 生成票据编号
      const ticketNumber = this.generateTicketNumber(year, totalCommands)

      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: generate-command-ticket completed in ${processingTime}ms`)

      return {
        success: true,
        data: {
          number: ticketNumber,
          name: `${year} Command Summary`,
          totalCommands: parseInt(totalCommands.toLocaleString().replace(/,/g, '')),
          activeDays,
          topCommand,
          shellCount,
          chartData,
          heatmapData: heatmapWrapperData,
          year,
          generatedAt: new Date().toISOString()
        },
        processingTimeMs: processingTime
      }
    } catch (err) {
      console.error(`IPC: generate-command-ticket (${year}) failed:`, err)
      
      return {
        success: false,
        year,
        error: err.message,
        data: null
      }
    }
  }

  /**
   * 转换热力图数据为HeatmapWrapper所需格式
   * @param {Array} heatmapData - 原始热力图数据 [['2024-01-01', 5], ...]
   * @returns {Array} HeatmapWrapper格式数据 [{ date: '2024-01-01', count: 5 }, ...]
   */
  convertToHeatmapWrapperFormat(heatmapData) {
    return heatmapData.map(([date, count]) => ({
      date,
      count
    }))
  }

  /**
   * 生成月度图表数据
   * @param {Array} heatmapData - 热力图数据
   * @returns {Array} 12个月的百分比数据
   */
  generateMonthlyChartData(heatmapData) {
    // 按月份聚合数据
    const monthlyData = new Array(12).fill(0)

    heatmapData.forEach(([date, count]) => {
      const month = new Date(date).getMonth()
      monthlyData[month] += count
    })

    // 转换为百分比
    const maxValue = Math.max(...monthlyData, 1)
    return monthlyData.map((value) => Math.round((value / maxValue) * 100))
  }

  /**
   * 获取指定年份的顶级命令
   * @param {Object} fullData - 完整数据
   * @param {number} year - 年份
   * @returns {string} 顶级命令
   */
  getTopCommand(fullData, year) {
    try {
      if (!fullData.analysis?.commandAnalysis?.topMainCommands) {
        return 'N/A'
      }

      // 简单返回全局最热门命令（可以后续优化为年份特定）
      const topCommands = Object.keys(fullData.analysis.commandAnalysis.topMainCommands)
      return topCommands[0] || 'N/A'
    } catch (err) {
      console.warn('Error getting top command:', err)
      return 'N/A'
    }
  }

  /**
   * 生成票据编号
   * @param {number} year - 年份
   * @param {number} totalCommands - 总命令数
   * @returns {string} 票据编号
   */
  generateTicketNumber(year, totalCommands) {
    const yearSuffix = year.toString().slice(-2)
    const commandHash = (totalCommands % 10000).toString().padStart(4, '0')
    return `${yearSuffix}${commandHash}`
  }

  /**
   * 处理 shell 历史诊断请求
   * @returns {Object} 诊断结果
   */
  async handleDiagnoseShellHistory() {
    try {
      console.log('IPC: diagnose-shell-history requested')
      const startTime = Date.now()

      // 执行诊断
      const diagnosis = await this.analyzer.fileReader.diagnoseShellHistory()
      
      const endTime = Date.now()
      const processingTime = endTime - startTime

      console.log(`IPC: diagnose-shell-history completed in ${processingTime}ms`)

      return {
        success: true,
        data: diagnosis,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    } catch (err) {
      console.error('IPC: diagnose-shell-history failed:', err)
      
      return {
        success: false,
        error: err.message,
        data: null,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 提取所有可用年份
   * @param {Object} fullData - 完整的历史数据
   * @returns {Array} 年份数组，从最新到最旧排序
   */
  extractAvailableYears(fullData) {
    console.log('Extracting available years from data')

    const entries = fullData.entries || []
    console.log(`Processing ${entries.length} entries for year extraction`)

    // 提取所有年份
    const years = new Set()
    entries.forEach((entry, index) => {
      if (entry.timestamp) {
        try {
          let date
          if (typeof entry.timestamp === 'number') {
            // Unix 时间戳（秒或毫秒）
            date = new Date(entry.timestamp > 1e10 ? entry.timestamp : entry.timestamp * 1000)
          } else if (typeof entry.timestamp === 'string') {
            date = new Date(entry.timestamp)
          } else if (entry.timestamp instanceof Date) {
            date = entry.timestamp
          } else {
            return
          }

          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            // 只包含合理的年份范围
            if (year >= 2020 && year <= 2030) {
              years.add(year)
            }
          }
        } catch (err) {
          console.warn(`Invalid timestamp in entry ${index}:`, entry.timestamp)
        }
      }
    })

    // 转换为数组并排序（最新年份在前）
    const yearsArray = Array.from(years).sort((a, b) => b - a)
    console.log(`Found available years: ${yearsArray.join(', ')}`)

    return yearsArray
  }

  /**
   * 清理 IPC 处理器
   * 移除所有注册的处理器
   */
  cleanup() {
    const handlers = [
      'get-shell-history',
      'refresh-shell-history',
      'get-cache-info',
      'get-time-range-stats',
      'get-yearly-heatmap-data',
      'get-available-years',
      'get-available-shells',
      'get-file-status',
      'get-date-commands',
      'generate-command-ticket',
      'diagnose-shell-history'
    ]

    handlers.forEach((handler) => {
      try {
        ipcMain.removeHandler(handler)
        console.log(`IPC handler removed: ${handler}`)
      } catch (err) {
        console.warn(`Failed to remove IPC handler ${handler}:`, err)
      }
    })

    console.log('IPC handlers cleanup completed')
  }
}

// 导出单例实例
let ipcHandlersInstance = null

/**
 * 初始化 IPC 处理器
 * @returns {IPCHandlers} IPC 处理器实例
 */
export function initializeIPCHandlers() {
  if (!ipcHandlersInstance) {
    ipcHandlersInstance = new IPCHandlers()
  }
  return ipcHandlersInstance
}

/**
 * 获取 IPC 处理器实例
 * @returns {IPCHandlers|null} IPC 处理器实例或 null
 */
export function getIPCHandlers() {
  return ipcHandlersInstance
}

/**
 * 清理 IPC 处理器
 */
export function cleanupIPCHandlers() {
  if (ipcHandlersInstance) {
    ipcHandlersInstance.cleanup()
    ipcHandlersInstance = null
  }
}
