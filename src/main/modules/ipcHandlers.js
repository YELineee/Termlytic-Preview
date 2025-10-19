/**
 * IPC Handlers Module
 * Handles communication between renderer process and main process
 * Provides shell history analysis related APIs
 */

import { ipcMain } from 'electron'
import { ShellHistoryAnalyzer } from '../services/shellHistoryAnalyzer.js'
import { getRemoteServerManager } from '../services/remoteServerManager.js'
import { getRemoteSyncService } from '../services/remoteSyncService.js'

/**
 * IPC Handlers Class
 * Manages all IPC communications related to shell history
 */


export class IPCHandlers {
  constructor() {
    this.analyzer = new ShellHistoryAnalyzer()
    this.remoteServerManager = getRemoteServerManager()
    this.remoteSyncService = getRemoteSyncService()
    this.setupHandlers()
    console.log('IPC handlers initialized')
  }

  /**
   * Setup all IPC handlers
   */
  setupHandlers() {
    // Get lightweight statistics (stats only, no raw data)
    ipcMain.handle('get-shell-stats-only', async () => {
      return await this.handleGetShellStatsOnly()
    })

    // Get paginated history records
    ipcMain.handle('get-shell-history-page', async (event, page = 0, limit = 100) => {
      return await this.handleGetShellHistoryPage(page, limit)
    })

    // Get lightweight statistics
    ipcMain.handle('get-shell-stats', async () => {
      return await this.handleGetShellStats()
    })

    // Get shell history analysis results (complete data)
    ipcMain.handle('get-shell-history', async () => {
      return await this.handleGetShellHistory()
    })

    // Force refresh data
    ipcMain.handle('refresh-shell-history', async () => {
      return await this.handleRefreshShellHistory()
    })

    // Get cache information
    ipcMain.handle('get-cache-info', async () => {
      return await this.handleGetCacheInfo()
    })

    // Clear cache
    ipcMain.handle('clear-cache', async () => {
      return await this.handleClearCache()
    })

    // Get time range statistics data
    ipcMain.handle('get-time-range-stats', async (event, timeRange, forceRefresh = false) => {
      return await this.handleGetTimeRangeStats(timeRange, forceRefresh)
    })

    // Get yearly heatmap data
    ipcMain.handle('get-yearly-heatmap-data', async (event, year, shellTypes = 'all', forceRefresh = false) => {
      return await this.handleGetYearlyHeatmapData(year, shellTypes, forceRefresh)
    })

    // Get available years list
    ipcMain.handle('get-available-years', async () => {
      return await this.handleGetAvailableYears()
    })

    // Get available shells list
    ipcMain.handle('get-available-shells', async () => {
      return await this.handleGetAvailableShells()
    })

    // Get file status information
    ipcMain.handle('get-file-status', async () => {
      return await this.handleGetFileStatus()
    })

    // Get command records for specific date
    ipcMain.handle('get-date-commands', async (event, date, shellTypes = 'all') => {
      return await this.handleGetDateCommands(date, shellTypes)
    })

    // Generate command ticket
    ipcMain.handle('generate-command-ticket', async (event, year, options = {}) => {
      return await this.handleGenerateCommandTicket(year, options)
    })

        // Diagnose shell history configuration
    ipcMain.handle('diagnose-shell-history', async () => {
      return await this.handleDiagnoseShellHistory()
    })

    // ========== Remote Server Management ==========

    // Get all remote servers
    ipcMain.handle('get-remote-servers', async () => {
      return await this.handleGetRemoteServers()
    })

    // Add new remote server
    ipcMain.handle('add-remote-server', async (event, serverConfig) => {
      return await this.handleAddRemoteServer(serverConfig)
    })

    // Update remote server
    ipcMain.handle('update-remote-server', async (event, serverId, updates) => {
      return await this.handleUpdateRemoteServer(serverId, updates)
    })

    // Delete remote server
    ipcMain.handle('delete-remote-server', async (event, serverId) => {
      return await this.handleDeleteRemoteServer(serverId)
    })

    // Toggle server enabled/disabled
    ipcMain.handle('toggle-remote-server', async (event, serverId, enabled) => {
      return await this.handleToggleRemoteServer(serverId, enabled)
    })

    // Test server connection
    ipcMain.handle('test-remote-connection', async (event, serverId) => {
      return await this.handleTestRemoteConnection(serverId)
    })

    // Sync server data
    ipcMain.handle('sync-remote-server', async (event, serverId) => {
      return await this.handleSyncRemoteServer(serverId)
    })

    // Get remote server stats
    ipcMain.handle('get-remote-servers-stats', async () => {
      return await this.handleGetRemoteServersStats()
    })

    // Get remote cache data
    ipcMain.handle('get-remote-cache', async (event, serverId) => {
      return await this.handleGetRemoteCache(serverId)
    })

    // Delete remote cache
    ipcMain.handle('delete-remote-cache', async (event, serverId) => {
      return await this.handleDeleteRemoteCache(serverId)
    })

    console.log('All IPC handlers registered')
  }

  /**
   * Handle lightweight statistics retrieval request (stats only, no raw data)
   * @returns {Object} Lightweight statistics result
   */
  async handleGetShellStatsOnly() {
    try {
      console.log('IPC: get-shell-stats-only requested')
      const startTime = Date.now()

      // Get analysis results only, not returning raw entries
      const result = await this.analyzer.analyzeShellHistory()

      // Build lightweight response (excluding entries)
      const lightResponse = {
        success: true,
        analysis: result.analysis,
        metadata: result.metadata,
        // Exclude entries array to significantly reduce data transfer
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
   * Handle paginated history retrieval request
   * @param {number} page - Page number (starting from 0)
   * @param {number} limit - Items per page
   * @returns {Object} Paginated history records
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

      // Pagination processing
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
        // Include analysis data only on first page
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
   * Handle Shell history retrieval request
   * @returns {Object} History analysis results
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
   * Handle force refresh request
   * @returns {Object} Refreshed analysis results
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
   * Handle cache info retrieval request
   * @returns {Object} Cache status information
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
   * Handle clear cache request
   * @returns {Object} Clear result
   */
  async handleClearCache() {
    try {
      console.log('IPC: clear-cache requested')

      const result = await this.analyzer.clearCache()

      console.log('IPC: clear-cache completed successfully')
      return {
        success: true,
        message: 'Cache cleared',
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
   * Handle get available Shells request
   * @returns {Object} Available Shell information
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
   * Handle file status retrieval request
   * @returns {Object} File status information
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
   * Handle time range statistics retrieval request
   * @param {string} timeRange - Time range ('day', 'week', 'month', 'year')
   * @returns {Object} Time range statistics data
   */
  async handleGetTimeRangeStats(timeRange, forceRefresh = false) {
    try {
      console.log(`IPC: get-time-range-stats requested for ${timeRange}, forceRefresh: ${forceRefresh}`)

      const startTime = Date.now()

      // Get complete history data (force refresh if requested)
      const fullData = forceRefresh 
        ? await this.analyzer.performFullAnalysis()
        : await this.analyzer.analyzeShellHistory()

      // Filter and aggregate data based on time range
      // Use allEntries for complete statistical analysis, not limited entries
      const rangeStats = this.analyzer.dataAnalyzer.getTimeRangeStatistics(fullData.allEntries || fullData.entries || [], timeRange)

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
   * Handle yearly heatmap data retrieval request
   * @param {number} year - Year
   * @param {string|string[]} shellTypes - Shell types ('all', 'bash', 'zsh', ['bash', 'zsh'])
   * @param {boolean} forceRefresh - Whether to force refresh data
   * @returns {Object} YearHeatmap data
   */
  async handleGetYearlyHeatmapData(year, shellTypes = 'all', forceRefresh = false) {
    try {
      console.log(
        `IPC: get-yearly-heatmap-data requested for year ${year}, shellTypes: ${shellTypes}, forceRefresh: ${forceRefresh}`
      )

      const startTime = Date.now()

      // Get complete history data (force refresh if requested)
      const fullData = forceRefresh 
        ? await this.analyzer.performFullAnalysis()
        : await this.analyzer.analyzeShellHistory()

      // Generate yearly heatmap data
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
   * Handle get available years list request
   * @returns {Object} Available years list
   */
  async handleGetAvailableYears() {
    try {
      console.log('IPC: get-available-years requested')

      const startTime = Date.now()

      // Get complete history data
      const fullData = await this.analyzer.analyzeShellHistory()

      // Extract all available years
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
   * Generate yearly heatmap data
   * @param {Object} fullData - Complete history data
   * @param {number} year - Year
   * @param {string|string[]} shellTypes - Shell type filter ('all', 'bash', 'zsh', ['bash', 'zsh'])
   * @returns {Array} ECharts heatmap data, format: [['2024-01-01', 5], ...]
   */
  generateYearlyHeatmapData(fullData, year, shellTypes = 'all') {
    console.log(`Generating ECharts heatmap data for year ${year}, shellTypes: ${shellTypes}`)
    console.log(`Total entries received: ${fullData.entries?.length || 0}`)

    const entries = fullData.entries || []

    // Debug: Check entry timestamp format
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

    // Filter data for specified year
    let yearEntries = entries.filter((entry) => {
      if (!entry.timestamp) return false

      try {
        // Handle different timestamp formats
        let date
        if (typeof entry.timestamp === 'number') {
          // Unix timestamp (seconds or milliseconds)
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

    // Filter data by shell type
    if (shellTypes !== 'all') {
      const targetShells = Array.isArray(shellTypes) ? shellTypes : [shellTypes]
      yearEntries = yearEntries.filter((entry) => {
        return entry.shell && targetShells.includes(entry.shell)
      })
      console.log(
        `After shell filtering (${targetShells.join(', ')}): ${yearEntries.length} entries`
      )
    }

    // Aggregate data by date
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

        const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD format

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

    // Generate all dates for the year and populate data (ECharts format)
    const startDate = new Date(year, 0, 1) // Start of year
    const endDate = new Date(year, 11, 31) // End of year
    const heatmapData = []

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0] // YYYY-MM-DD format
      const count = dailyCounts[dateKey] || 0
      heatmapData.push([dateKey, count])
    }

    // Statistics
    const totalCommands = heatmapData.reduce((sum, [, count]) => sum + count, 0)
    const activeDays = heatmapData.filter(([, count]) => count > 0).length

    console.log(`Generated ECharts heatmap data with ${heatmapData.length} days`)
    console.log(`  - Total commands: ${totalCommands}`)
    console.log(`  - Active days: ${activeDays}`)
    console.log(`  - Max daily commands: ${Math.max(...heatmapData.map(([, count]) => count))}`)

    return heatmapData
  }

  /**
   * Handle specific date command records retrieval request
   * @param {string} date - Date string (YYYY-MM-DD)
   * @param {string|string[]} shellTypes - Shell type filter
   * @returns {Object} Command records for specified date
   */
  async handleGetDateCommands(date, shellTypes = 'all') {
    try {
      console.log(`IPC: get-date-commands requested for ${date}, shellTypes: ${shellTypes}`)

      const startTime = Date.now()

      // Get complete history data
      const fullData = await this.analyzer.analyzeShellHistory()
      const entries = fullData.entries || []

      // Parse target date
      const targetDate = new Date(date)
      if (isNaN(targetDate.getTime())) {
        throw new Error(`Invalid date format: ${date}`)
      }

      // Set date range (start and end of the day)
      const dayStart = new Date(targetDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(targetDate)
      dayEnd.setHours(23, 59, 59, 999)

      // Filter commands for specified date
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

      // Filter by shell type
      if (shellTypes !== 'all') {
        const targetShells = Array.isArray(shellTypes) ? shellTypes : [shellTypes]
        dateEntries = dateEntries.filter((entry) => {
          return entry.shell && targetShells.includes(entry.shell)
        })
      }

      // Convert to frontend expected format
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
   * Handle command ticket generation request
   * @param {number} year - Year
   * @param {Object} options - Generation options
   * @returns {Object} Complete ticket data
   */
  async handleGenerateCommandTicket(year, options = {}) {
    try {
      console.log(`IPC: generate-command-ticket requested for year ${year}`)
      const startTime = Date.now()

      // 1. Get complete history data
      const fullData = await this.analyzer.analyzeShellHistory()

      // 2. Generate heatmap data
      const heatmapData = this.generateYearlyHeatmapData(fullData, year, 'all')

      // 3. Convert to HeatmapWrapper required format
      const heatmapWrapperData = this.convertToHeatmapWrapperFormat(heatmapData)

      // 4. Calculate basic statistics
      const totalCommands = heatmapData.reduce((sum, [, count]) => sum + count, 0)
      const activeDays = heatmapData.filter(([, count]) => count > 0).length

      // 5. Generate chart data (monthly statistics)
      const chartData = this.generateMonthlyChartData(heatmapData)

      // 6. Get top command and other statistics
      const topCommand = this.getTopCommand(fullData, year)
      const shellCount = Object.keys(fullData.analysis?.shells || {}).length

      // 7. Generate ticket number
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
   * Convert heatmap data to HeatmapWrapper required format
   * @param {Array} heatmapData - Raw heatmap data [['2024-01-01', 5], ...]
   * @returns {Array} HeatmapWrapper format data [{ date: '2024-01-01', count: 5 }, ...]
   */
  convertToHeatmapWrapperFormat(heatmapData) {
    return heatmapData.map(([date, count]) => ({
      date,
      count
    }))
  }

  /**
   * Generate monthly chart data
   * @param {Array} heatmapData - Heatmap data
   * @returns {Array} 12 months percentage data
   */
  generateMonthlyChartData(heatmapData) {
    // Aggregate data by month
    const monthlyData = new Array(12).fill(0)

    heatmapData.forEach(([date, count]) => {
      const month = new Date(date).getMonth()
      monthlyData[month] += count
    })

    // Convert to percentage
    const maxValue = Math.max(...monthlyData, 1)
    return monthlyData.map((value) => Math.round((value / maxValue) * 100))
  }

  /**
   * Get top command for specified year
   * @param {Object} fullData - Complete data
   * @param {number} year - Year
   * @returns {string} Top command
   */
  getTopCommand(fullData, year) {
    try {
      if (!fullData.analysis?.commandAnalysis?.topMainCommands) {
        return 'N/A'
      }

      // Simply return global top command (can be optimized for year-specific later)
      const topCommands = Object.keys(fullData.analysis.commandAnalysis.topMainCommands)
      return topCommands[0] || 'N/A'
    } catch (err) {
      console.warn('Error getting top command:', err)
      return 'N/A'
    }
  }

  /**
   * Generate ticket number
   * @param {number} year - Year
   * @param {number} totalCommands - Total commands count
   * @returns {string} Ticket number
   */
  generateTicketNumber(year, totalCommands) {
    const yearSuffix = year.toString().slice(-2)
    const commandHash = (totalCommands % 10000).toString().padStart(4, '0')
    return `${yearSuffix}${commandHash}`
  }

  /**
   * Handle shell history diagnosis request
   * @returns {Object} Diagnosis results
   */
  async handleDiagnoseShellHistory() {
    try {
      console.log('IPC: diagnose-shell-history requested')
      const startTime = Date.now()

      // Execute diagnosis
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
   * Extract all available years
   * @param {Object} fullData - Complete history data
   * @returns {Array} Years array, sorted from newest to oldest
   */
  extractAvailableYears(fullData) {
    console.log('Extracting available years from data')

    const entries = fullData.entries || []
    console.log(`Processing ${entries.length} entries for year extraction`)

    // Extract all years
    const years = new Set()
    entries.forEach((entry, index) => {
      if (entry.timestamp) {
        try {
          let date
          if (typeof entry.timestamp === 'number') {
            // Unix timestamp (seconds or milliseconds)
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
            // Only include reasonable year range
            if (year >= 2020 && year <= 2030) {
              years.add(year)
            }
          }
        } catch (err) {
          console.warn(`Invalid timestamp in entry ${index}:`, entry.timestamp)
        }
      }
    })

    // Convert to array and sort (newest year first)
    const yearsArray = Array.from(years).sort((a, b) => b - a)
    console.log(`Found available years: ${yearsArray.join(', ')}`)

    return yearsArray
  }

  /**
   * Cleanup IPC handlers
   * Remove all registered handlers
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

  // ========== Remote Server Handler Methods ==========

  /**
   * Get all remote servers
   */
  async handleGetRemoteServers() {
    try {
      await this.remoteServerManager.initialize()
      const servers = this.remoteServerManager.getAllServers()
      return {
        success: true,
        servers
      }
    } catch (error) {
      console.error('Error getting remote servers:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Add remote server
   */
  async handleAddRemoteServer(serverConfig) {
    try {
      const server = await this.remoteServerManager.addServer(serverConfig)
      return {
        success: true,
        server
      }
    } catch (error) {
      console.error('Error adding remote server:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Update remote server
   */
  async handleUpdateRemoteServer(serverId, updates) {
    try {
      const server = await this.remoteServerManager.updateServer(serverId, updates)
      return {
        success: true,
        server
      }
    } catch (error) {
      console.error('Error updating remote server:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Delete remote server
   */
  async handleDeleteRemoteServer(serverId) {
    try {
      // Delete cache first
      await this.remoteSyncService.deleteRemoteCache(serverId)
      
      // Then delete server configuration
      const result = await this.remoteServerManager.deleteServer(serverId)
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error('Error deleting remote server:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Toggle remote server
   */
  async handleToggleRemoteServer(serverId, enabled) {
    try {
      const server = await this.remoteServerManager.toggleServer(serverId, enabled)
      return {
        success: true,
        server
      }
    } catch (error) {
      console.error('Error toggling remote server:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Test remote connection
   */
  async handleTestRemoteConnection(serverId) {
    try {
      const server = this.remoteServerManager.getServerById(serverId)
      
      // Get full server information (including password)
      const fullServer = this.remoteServerManager.servers.find(s => s.id === serverId)
      
      const result = await this.remoteSyncService.testConnection(fullServer)
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error('Error testing remote connection:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Sync remote server
   */
  async handleSyncRemoteServer(serverId) {
    try {
      const server = this.remoteServerManager.getServerById(serverId)
      
      // Get full server information
      const fullServer = this.remoteServerManager.servers.find(s => s.id === serverId)
      
      const result = await this.remoteSyncService.syncServer(fullServer)
      
      // Update server sync status
      await this.remoteServerManager.updateSyncStatus(
        serverId,
        'synced',
        result.commandCount
      )
      
      return {
        success: true,
        ...result
      }
    } catch (error) {
      console.error('Error syncing remote server:', error)
      
      // Update failure status
      await this.remoteServerManager.updateSyncStatus(serverId, 'sync_failed')
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get remote servers stats
   */
  async handleGetRemoteServersStats() {
    try {
      await this.remoteServerManager.initialize()
      const stats = this.remoteServerManager.getStats()
      const cacheStats = await this.remoteSyncService.getAllRemoteCacheStats()
      
      return {
        success: true,
        stats,
        cacheStats
      }
    } catch (error) {
      console.error('Error getting remote servers stats:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get remote cache
   */
  async handleGetRemoteCache(serverId) {
    try {
      const cache = await this.remoteSyncService.loadRemoteCache(serverId)
      return {
        success: true,
        cache
      }
    } catch (error) {
      console.error('Error getting remote cache:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Delete remote cache
   */
  async handleDeleteRemoteCache(serverId) {
    try {
      await this.remoteSyncService.deleteRemoteCache(serverId)
      
      // Reset server sync status
      await this.remoteServerManager.updateSyncStatus(serverId, 'never_synced', 0)
      
      return {
        success: true
      }
    } catch (error) {
      console.error('Error deleting remote cache:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }
}

// Singleton instance
let ipcHandlersInstance = null

/**
 * Initialize IPC handlers
 * @returns {IPCHandlers} IPC handlers instance
 */
export function initializeIPCHandlers() {
  if (!ipcHandlersInstance) {
    ipcHandlersInstance = new IPCHandlers()
  }
  return ipcHandlersInstance
}

/**
 * Get IPC handlers instance
 * @returns {IPCHandlers|null} IPC handlers instance or null
 */
export function getIPCHandlers() {
  return ipcHandlersInstance
}

/**
 * Cleanup IPC handlers
 */
export function cleanupIPCHandlers() {
  if (ipcHandlersInstance) {
    ipcHandlersInstance.cleanup()
    ipcHandlersInstance = null
  }
}
