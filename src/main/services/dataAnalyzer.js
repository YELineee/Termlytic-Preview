/**
 * Data analysis module for shell history statistics
 */

/**
 * Shell history data analyzer
 */
export class DataAnalyzer {
  constructor() {
    this.config = {
      maxTopCommands: 50,
      dayStartHour: 6,
      dayEndHour: 18
    }
  }

  /**
   * Analyze shell history entries
   */
  analyzeData(entries) {
    console.log(`Starting analysis of ${entries.length} entries...`)

    const validEntries = this.preFilterEntries(entries)
    console.log(`Valid entries after filtering: ${validEntries.length}`)

    const analysis = {
      totalCommands: validEntries.length,
      originalTotal: entries.length,
      filteredOut: entries.length - validEntries.length,
      shells: {},
      generatedAt: new Date().toISOString(),
      timeAnalysis: this.initializeTimeAnalysis(),
      commandAnalysis: this.initializeCommandAnalysis()
    }

    this.processBatchEntries(validEntries, analysis)

    // Post-processing and sorting
    this.finalizeAnalysis(analysis)

    console.log('Analysis completed')
    console.log(`Performance summary:`)
    console.log(`  - Processed: ${validEntries.length} entries`)
    console.log(`  - Filtered out: ${analysis.filteredOut} invalid entries`)
    console.log(`  - Active days: ${analysis.timeAnalysis.activeDays}`)
    console.log(`  - Unique commands: ${analysis.commandAnalysis.uniqueCommandsCount}`)

    return analysis
  }

  /**
   * Analyze history entries (alias for analyzeData)
   * @param {Array} entries - Array of history entries
   * @returns {Object} Complete analysis result
   */
  analyzeEntries(entries) {
    return this.analyzeData(entries)
  }

  /**
   * Pre-filter entries to improve performance
   * @param {Array} entries - Array of raw entries
   * @returns {Array} Filtered valid entries
   */
  preFilterEntries(entries) {
    const validEntries = []
    const seenCommands = new Set()

    for (const entry of entries) {
      // Basic validation
      if (!entry || !entry.commandInfo || !entry.commandInfo.full) {
        continue
      }

      // Skip obviously invalid commands
      const command = entry.commandInfo.full.trim()
      if (command.length === 0 || command.length > 1000) {
        continue
      }

      // Skip duplicate consecutive commands
      const commandKey = `${command}_${entry.timestamp || 'no-time'}`
      if (seenCommands.has(commandKey)) {
        continue
      }
      seenCommands.add(commandKey)

      validEntries.push(entry)
    }

    return validEntries
  }

  /**
   * Batch process entries to improve performance
   * @param {Array} entries - Array of valid entries
   * @param {Object} analysis - Analysis result object
   */
  processBatchEntries(entries, analysis) {
    const batchSize = 1000

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize)

      if (i % (batchSize * 5) === 0) {
        console.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            entries.length / batchSize
          )}`
        )
      }

      // Process current batch
      for (const entry of batch) {
        this.processEntry(entry, analysis)
      }

      // Give main thread some breathing time
      if (i % (batchSize * 10) === 0) {
        // Can add setImmediate or similar async processing here
        // But in Node.js main process, we simply continue
      }
    }
  }

  /**
   * Initialize time analysis structure
   * @returns {Object} Time analysis object
   */
  initializeTimeAnalysis() {
    return {
      dailyStats: {}, // Daily command stats
      hourlyDistribution: new Array(24).fill(0), // 24-hour distribution
      weeklyStats: {}, // Weekly stats
      monthlyStats: {}, // Monthly stats
      yearlyStats: {}, // Yearly stats
      activeDays: new Set(), // Active days set
      dayVsNight: { day: 0, night: 0 }, // Day vs night
      weekdayStats: new Array(7).fill(0), // Weekday stats (0=Sunday)
      commandsPerDay: {}, // Commands per day
      longestStreak: 0, // Longest streak
      currentStreak: 0 // Current streak
    }
  }

  /**
   * Initialize command analysis structure
   * @returns {Object} Command analysis object
   */
  initializeCommandAnalysis() {
    return {
      topCommands: {}, // Full command frequency
      topMainCommands: {}, // Main command frequency
      topSubCommands: {}, // Sub command frequency
      uniqueCommands: new Set(), // Unique commands set
      commandsByShell: {}, // Commands grouped by shell
      commandTrends: {}, // Command usage trends
      errorCommands: [], // Possible error commands
      newCommands: [] // Newly discovered commands
    }
  }

  /**
   * Process single history entry
   * @param {Object} entry - History entry
   * @param {Object} analysis - Analysis result object（will be modified）
   */
  processEntry(entry, analysis) {
    const { shell, commandInfo, timestamp } = entry

    // Shell usage statistics
    this.updateShellStats(shell, analysis)

    // Command usage statistics
    this.updateCommandStats(commandInfo, shell, analysis)

    // Time-related statistics (if timestamps available)
    if (timestamp && this.isValidTimestamp(timestamp)) {
      this.updateTimeStats(timestamp, analysis)
    }
  }

  /**
   * Update Shell usage statistics
   * @param {string} shell - Shell type
   * @param {Object} analysis - Analysis result object
   */
  updateShellStats(shell, analysis) {
    if (!analysis.shells[shell]) {
      analysis.shells[shell] = 0
    }
    analysis.shells[shell]++
  }

  /**
   * Update command usage statistics
   * @param {Object} commandInfo - Command information
   * @param {string} shell - Shell type
   * @param {Object} analysis - Analysis result object
   */
  updateCommandStats(commandInfo, shell, analysis) {
    const { main, sub, full } = commandInfo
    const cmdAnalysis = analysis.commandAnalysis

    // Record unique commands
    cmdAnalysis.uniqueCommands.add(full)

    // Main command frequency statistics
    this.incrementCounter(cmdAnalysis.topMainCommands, main)

    // Full command frequency statistics
    this.incrementCounter(cmdAnalysis.topCommands, full)

    // Subcommand statistics
    if (sub) {
      const subCmdKey = `${main} ${sub}`
      this.incrementCounter(cmdAnalysis.topSubCommands, subCmdKey)
    }

    // Command statistics grouped by Shell
    if (!cmdAnalysis.commandsByShell[shell]) {
      cmdAnalysis.commandsByShell[shell] = {}
    }
    this.incrementCounter(cmdAnalysis.commandsByShell[shell], main)
  }

  /**
   * Update time-related statistics
   * @param {*} timestamp - Timestamp (number, string, or Date object)
   * @param {Object} analysis - Analysis result object
   */
  updateTimeStats(timestamp, analysis) {
    const timeAnalysis = analysis.timeAnalysis

    // Ensure conversion to valid Date object
    let date
    if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'number') {
      // Unix timestamp (seconds or milliseconds)
      date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      return // Invalid timestamp, skip processing
    }

    // Verify date validity again
    if (!this.isValidDate(date)) {
      return
    }

    // Basic time information
    const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD
    const hour = date.getHours()
    const weekday = date.getDay() // 0 = Sunday
    const weekNum = this.getWeekNumber(date)
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    const yearKey = date.getFullYear().toString()

    // Daily statistics
    this.incrementCounter(timeAnalysis.dailyStats, dateStr)
    timeAnalysis.activeDays.add(dateStr)

    // Hourly distribution statistics
    timeAnalysis.hourlyDistribution[hour]++

    // Weekly statistics
    timeAnalysis.weekdayStats[weekday]++

    // Day vs night statistics
    if (hour >= this.config.dayStartHour && hour < this.config.dayEndHour) {
      timeAnalysis.dayVsNight.day++
    } else {
      timeAnalysis.dayVsNight.night++
    }

    // Weekly, monthly, yearly statistics
    this.incrementCounter(timeAnalysis.weeklyStats, weekNum)
    this.incrementCounter(timeAnalysis.monthlyStats, monthKey)
    this.incrementCounter(timeAnalysis.yearlyStats, yearKey)
  }

  /**
   * Complete post-processing work for analysis
   * @param {Object} analysis - Analysis result object
   */
  finalizeAnalysis(analysis) {
    const cmdAnalysis = analysis.commandAnalysis
    const timeAnalysis = analysis.timeAnalysis

    // Convert Set to numerical value
    timeAnalysis.activeDays = timeAnalysis.activeDays.size
    cmdAnalysis.uniqueCommandsCount = cmdAnalysis.uniqueCommands.size
    delete cmdAnalysis.uniqueCommands

    // Sort popular commands (keep only top N)
    cmdAnalysis.topMainCommands = this.sortAndLimitObject(
      cmdAnalysis.topMainCommands,
      this.config.maxTopCommands
    )
    cmdAnalysis.topCommands = this.sortAndLimitObject(
      cmdAnalysis.topCommands,
      this.config.maxTopCommands
    )
    cmdAnalysis.topSubCommands = this.sortAndLimitObject(
      cmdAnalysis.topSubCommands,
      this.config.maxTopCommands
    )

    // Calculate usage continuity
    this.calculateUsageStreaks(timeAnalysis)

    // Calculate average daily command count
    this.calculateDailyAverages(timeAnalysis)

    console.log(`Analysis summary:`)
    console.log(`  - Total commands: ${analysis.totalCommands}`)
    console.log(`  - Active days: ${timeAnalysis.activeDays}`)
    console.log(`  - Unique commands: ${cmdAnalysis.uniqueCommandsCount}`)
    console.log(`  - Top command: ${Object.keys(cmdAnalysis.topMainCommands)[0] || 'N/A'}`)
  }

  /**
   * Calculate usage continuitystatistics
   * @param {Object} timeAnalysis - Time analysis object
   */
  calculateUsageStreaks(timeAnalysis) {
    const sortedDates = Object.keys(timeAnalysis.dailyStats).sort()
    let currentStreak = 0
    let maxStreak = 0
    let lastDate = null

    for (const dateStr of sortedDates) {
      const currentDate = new Date(dateStr)

      if (lastDate) {
        const dayDiff = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24))

        if (dayDiff === 1) {
          currentStreak++
        } else {
          maxStreak = Math.max(maxStreak, currentStreak)
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }

      lastDate = currentDate
    }

    timeAnalysis.longestStreak = Math.max(maxStreak, currentStreak)
    timeAnalysis.currentStreak = this.calculateCurrentStreak(sortedDates)
  }

  /**
   * Calculate current consecutive usage days
   * @param {Array} sortedDates - Sorted date array
   * @returns {number} Current consecutive days
   */
  calculateCurrentStreak(sortedDates) {
    if (sortedDates.length === 0) return 0

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    let streak = 0

    for (let i = sortedDates.length - 1; i >= 0; i--) {
      const date = new Date(sortedDates[i])
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - streak)

      if (date.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  /**
   * Calculate daily average statistics
   * @param {Object} timeAnalysis - Time analysis object
   */
  calculateDailyAverages(timeAnalysis) {
    const totalDays = timeAnalysis.activeDays
    if (totalDays > 0) {
      timeAnalysis.averageCommandsPerDay = Math.round(
        Object.values(timeAnalysis.dailyStats).reduce((sum, count) => sum + count, 0) / totalDays
      )
    } else {
      timeAnalysis.averageCommandsPerDay = 0
    }
  }

  // Utility methods

  /**
   * Safely increment counter
   * @param {Object} obj - Target object
   * @param {string} key - Key name
   */
  incrementCounter(obj, key) {
    if (!obj[key]) {
      obj[key] = 0
    }
    obj[key]++
  }

  /**
   * Sort object by value and limit quantity
   * @param {Object} obj - Object to sort
   * @param {number} limit - Limit quantity
   * @returns {Object} Sorted object
   */
  sortAndLimitObject(obj, limit = 50) {
    return Object.entries(obj)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .reduce((result, [key, value]) => {
        result[key] = value
        return result
      }, {})
  }

  /**
   * Get ISO week number
   * @param {Date} date - Date object
   * @returns {string} Formatted week number string
   */
  getWeekNumber(date) {
    const target = new Date(date)
    const dayNumber = (date.getDay() + 6) % 7
    target.setDate(target.getDate() - dayNumber + 3)
    const firstThursday = target.valueOf()
    target.setMonth(0, 1)
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7))
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000)
    return `${target.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`
  }

  /**
   * Validate if timestamp is valid
   * @param {*} timestamp - Timestamp to validate (can be number, string, or Date object)
   * @returns {boolean} Whether it is a valid timestamp
   */
  isValidTimestamp(timestamp) {
    if (!timestamp) return false

    let date
    if (timestamp instanceof Date) {
      date = timestamp
    } else if (typeof timestamp === 'number') {
      // Unix timestamp (seconds or milliseconds)
      date = new Date(timestamp > 1e10 ? timestamp : timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      return false
    }

    return !isNaN(date.getTime()) && date.getFullYear() > 1990 && date.getFullYear() < 2100
  }

  /**
   * Validate if Date object is valid
   * @param {Date} date - Date to validate
   * @returns {boolean} Whether it is a valid date
   */
  isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime())
  }

  /**
   * Get statistics data for specified time range
   * @param {Array} entries - Array of history entries
   * @param {string} timeRange - Time range (day, week, month, year)
   * @returns {Object} Time range statistics result
   */
  getTimeRangeStatistics(entries, timeRange) {
    console.log(`Generating statistics for time range: ${timeRange}`)
    
    if (!entries || entries.length === 0) {
      return this.getEmptyTimeRangeStats(timeRange)
    }

    const now = new Date()
    let startDate, endDate

    // Determine time range
    switch (timeRange) {
      case 'day':
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        endDate.setHours(23, 59, 59, 999)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
        break
      case 'all':
        // For 'all', use all available data - no date filtering
        startDate = null
        endDate = null
        break
      default:
        return this.getEmptyTimeRangeStats(timeRange)
    }

    // Filter entries within specified time range
    const rangeEntries = timeRange === 'all' 
      ? entries 
      : entries.filter(entry => {
          if (!entry.timestamp) return false
          
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

          return entryDate >= startDate && entryDate <= endDate
        })

    // Analyze data within time range
    const analysis = this.analyzeData(rangeEntries)
    
    // Generate chart data
    const chartData = this.generateChartData(rangeEntries, timeRange, startDate, endDate)

    return {
      timeRange,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      totalCount: rangeEntries.length, // Changed to totalCount to match frontend
      periodStats: { // Wrapped as periodStats object
        uniqueCommands: analysis.commandAnalysis.uniqueCommandsCount || 0
      },
      activeDays: analysis.timeAnalysis.activeDays ? analysis.timeAnalysis.activeDays.size : 0,
      topCommands: analysis.commandAnalysis.topCommands || {},
      shells: analysis.shells || {},
      hourlyDistribution: analysis.timeAnalysis.hourlyDistribution || new Array(24).fill(0),
      weekdayStats: analysis.timeAnalysis.weekdayStats || new Array(7).fill(0),
      chartData, // Add chart data
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generate chart data
   * @param {Array} entries - Entries within time range
   * @param {string} timeRange - Time range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} Chart data
   */
  generateChartData(entries, timeRange, startDate, endDate) {
    const labels = []
    const data = []
    const dailyCounts = new Map()

    // Initialize date mapping
    entries.forEach(entry => {
      if (!entry.timestamp) return
      
      let entryDate
      if (typeof entry.timestamp === 'number') {
        entryDate = new Date(entry.timestamp > 1e10 ? entry.timestamp : entry.timestamp * 1000)
      } else if (typeof entry.timestamp === 'string') {
        entryDate = new Date(entry.timestamp)
      } else if (entry.timestamp instanceof Date) {
        entryDate = entry.timestamp
      } else {
        return
      }

      let dateKey
      switch (timeRange) {
        case 'day':
          // Group by hour
          dateKey = `${entryDate.getHours()}:00`
          break
        case 'week':
          // Group by day
          dateKey = entryDate.toISOString().split('T')[0]
          break
        case 'month':
          // Group by day
          dateKey = entryDate.toISOString().split('T')[0]
          break
        case 'year':
          // Group by month
          dateKey = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`
          break
        case 'all':
          // Group by month for all time data
          dateKey = `${entryDate.getFullYear()}-${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`
          break
        default:
          dateKey = entryDate.toISOString().split('T')[0]
      }

      dailyCounts.set(dateKey, (dailyCounts.get(dateKey) || 0) + 1)
    })

    // Generate labels and data
    switch (timeRange) {
      case 'day':
        // Generate 24-hour labels
        for (let hour = 0; hour < 24; hour++) {
          const hourLabel = `${hour.toString().padStart(2, '0')}:00`
          labels.push(hourLabel)
          data.push(dailyCounts.get(hourLabel) || 0)
        }
        break
      case 'week':
        // Generate labels for past 7 days
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        for (let i = 6; i >= 0; i--) {
          const date = new Date(endDate)
          date.setDate(endDate.getDate() - i)
          const dateKey = date.toISOString().split('T')[0]
          const dayOfWeek = weekDays[date.getDay()]
          const label = `${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`
          labels.push(label)
          data.push(dailyCounts.get(dateKey) || 0)
        }
        break
      case 'month':
        // Generate labels for each day of the month
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          const dateKey = currentDate.toISOString().split('T')[0]
          const label = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`
          labels.push(label)
          data.push(dailyCounts.get(dateKey) || 0)
          currentDate.setDate(currentDate.getDate() + 1)
        }
        break
      case 'year':
        // Generate 12 month labels
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        for (let month = 1; month <= 12; month++) {
          const monthKey = `${startDate.getFullYear()}-${month.toString().padStart(2, '0')}`
          labels.push(months[month - 1])
          data.push(dailyCounts.get(monthKey) || 0)
        }
        break
      case 'all':
        // Generate labels for all months with data
        if (dailyCounts.size === 0) {
          // No data, return empty chart
          break
        }
        
        // Sort all month keys
        const sortedMonthKeys = Array.from(dailyCounts.keys()).sort()
        const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        sortedMonthKeys.forEach(monthKey => {
          const [year, month] = monthKey.split('-')
          const monthIndex = parseInt(month) - 1
          labels.push(`${monthsShort[monthIndex]} ${year}`)
          data.push(dailyCounts.get(monthKey) || 0)
        })
        break
    }

    return { labels, data }
  }

  /**
   * Get empty time range statistics result
   * @param {string} timeRange - Time range
   * @returns {Object} Empty statistics result
   */
  getEmptyTimeRangeStats(timeRange) {
    // Generate empty chart data
    let labels = []
    let data = []

    switch (timeRange) {
      case 'day':
        labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
        data = new Array(24).fill(0)
        break
      case 'week':
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const now = new Date()
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(now.getDate() - i)
          const dayOfWeek = weekDays[date.getDay()]
          labels.push(`${date.getMonth() + 1}/${date.getDate()} (${dayOfWeek})`)
          data.push(0)
        }
        break
      case 'month':
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
        for (let day = 1; day <= daysInMonth; day++) {
          labels.push(`${new Date().getMonth() + 1}/${day}`)
          data.push(0)
        }
        break
      case 'year':
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        labels = [...months]
        data = new Array(12).fill(0)
        break
      case 'all':
        // Empty data for all time - no default labels
        labels = []
        data = []
        break
    }

    return {
      timeRange,
      startDate: null,
      endDate: null,
      totalCount: 0,
      periodStats: {
        uniqueCommands: 0
      },
      activeDays: 0,
      topCommands: {},
      shells: {},
      hourlyDistribution: new Array(24).fill(0),
      weekdayStats: new Array(7).fill(0),
      chartData: { labels, data },
      generatedAt: new Date().toISOString()
    }
  }
}
