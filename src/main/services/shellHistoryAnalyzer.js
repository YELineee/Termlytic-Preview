/**
 * Shell history analyzer main module
 * Integrates all sub-modules for complete history analysis
 */

import { DataStorageManager } from './dataStorage.js'
import { DataAnalyzer } from './dataAnalyzer.js'
import { FileReaderService } from './fileReader.js'

export class ShellHistoryAnalyzer {
  constructor() {
    this.storageManager = new DataStorageManager()
    this.dataAnalyzer = new DataAnalyzer()
    this.fileReader = new FileReaderService()

    console.log('ShellHistoryAnalyzer initialized')
  }

  /**
   * Main analysis entry point with incremental updates and caching
   */
  async analyzeShellHistory() {
    try {
      console.log('=== Starting Shell History Analysis ===')

      console.log('Checking for file changes...')
      const fileStatusResult = await this.fileReader.getAllFileStatus()
      const currentFiles = fileStatusResult.configured // Fix: use configured files
      const metadata = await this.storageManager.loadMetadata()

      let needsUpdate = false
      
      for (const [shell, fileInfo] of Object.entries(currentFiles)) {
        const lastInfo = metadata.files[shell] || { size: 0, mtime: 0 }
        
        if (fileInfo.exists && (fileInfo.size !== lastInfo.size || fileInfo.mtime !== lastInfo.mtime)) {
          console.log(`File changed: ${shell} (${fileInfo.path})`)
          console.log(`  Size: ${lastInfo.size} -> ${fileInfo.size}`)
          console.log(`  MTime: ${lastInfo.mtime} -> ${fileInfo.mtime}`)
          needsUpdate = true
        }
      }

      if (!needsUpdate) {
        console.log('No updates needed, loading from cache...')
        return await this.loadCachedData()
      }

      console.log('Updates detected, performing incremental analysis...')
      return await this.performIncrementalUpdate(currentFiles, metadata)
    } catch (err) {
      console.error('Error in analyzeShellHistory:', err)

      // Try fallback to cached data
      return await this.handleAnalysisError(err)
    }
  }

  /**
   * Load cached data
   * @returns {Object} Cached analysis result
   */
  async loadCachedData() {
    const cachedData = await this.storageManager.loadStoredData()

    if (cachedData.entries && cachedData.entries.length > 0) {
      console.log(`Loaded ${cachedData.entries.length} cached entries`)

      return {
        ...cachedData,
        entries: cachedData.entries.slice(0, 10000), // Limit returned entries
        fromCache: true,
        lastUpdate: cachedData.lastUpdate ? new Date(cachedData.lastUpdate).toISOString() : null,
        cacheInfo: await this.storageManager.getCacheInfo()
      }
    } else {
      console.log('No valid cached data found, performing full analysis...')
      return await this.performFullAnalysis()
    }
  }

  /**
   * Perform incremental update
   * @param {Object} currentFiles - Current file status
   * @param {Object} metadata - Stored metadata
   * @returns {Object} Updated analysis result
   */
  async performIncrementalUpdate(currentFiles, metadata) {
    // Load existing data
    const existingData = await this.storageManager.loadStoredData()
    let allEntries = existingData.entries || []

    console.log(`Starting with ${allEntries.length} existing entries`)

    // If no sufficient cached data, perform full analysis
    if (allEntries.length < 100) {
      console.log('Insufficient cached data, performing full analysis instead...')
      return await this.performFullAnalysis()
    }

    // Process incremental updates for each file
    for (const [shell, currentInfo] of Object.entries(currentFiles)) {
      if (!currentInfo.exists) continue

      const lastInfo = metadata.files[shell] || { size: 0, mtime: 0 }

      if (currentInfo.size > lastInfo.size) {
        // File grew, read incremental content
        console.log(`Processing incremental update for ${shell}`)
        try {
          const incrementalEntries = await this.fileReader.readShellHistory(shell, lastInfo.size)
          allEntries = allEntries.concat(incrementalEntries)
          console.log(`Added ${incrementalEntries.length} new entries from ${shell}`)
        } catch (err) {
          console.error(`Error reading incremental data from ${shell}:`, err)
        }
      } else if (currentInfo.size < lastInfo.size) {
        // File shrank, may be reset, re-read entire file
        console.log(`File size decreased for ${shell}, performing full re-read`)
        try {
          // Remove all old entries for this shell
          allEntries = allEntries.filter(entry => entry.shell !== shell)
          
          // Re-read entire file
          const newEntries = await this.fileReader.readShellHistory(shell)
          allEntries = allEntries.concat(newEntries)
          console.log(`Re-read ${newEntries.length} entries from ${shell}`)
        } catch (err) {
          console.error(`Error re-reading ${shell}:`, err)
        }
      }
    }

    // Generate final results
    return await this.generateFinalResult(allEntries, currentFiles, false)
  }

  /**
   * Perform complete analysis
   * @returns {Object} Complete analysis result
   */
  async performFullAnalysis() {
    console.log('Performing full analysis of all shell history files...')
    
    try {
      // Read all history files
      const historyData = await this.fileReader.readAllShellHistory()
      const fileStatusResult = await this.fileReader.getAllFileStatus()
      const currentFiles = fileStatusResult.configured // Fix: use configured files

      return await this.generateFinalResult(historyData.entries, currentFiles, true)
    } catch (err) {
      console.error('Error in full analysis:', err)
      throw err
    }
  }

  /**
   * Generate final analysis result
   * @param {Array} entries - All history entries
   * @param {Object} currentFiles - Current file status
   * @param {boolean} isFullAnalysis - Whether it is a complete analysis
   * @returns {Object} Analysis result
   */
  async generateFinalResult(entries, currentFiles, isFullAnalysis = false) {
    console.log(`Generating final result with ${entries.length} total entries`)

    // Sort by timestamp (newest first)
    entries.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })

    // Perform data analysis
    const analysis = await this.dataAnalyzer.analyzeEntries(entries)

    // Build final results
    const result = {
      entries: entries.slice(0, 10000), // Limit returned entries，Avoid memory issues
      analysis,
      metadata: {
        totalEntries: entries.length,
        files: currentFiles,
        lastUpdate: new Date().toISOString(),
        analysisType: isFullAnalysis ? 'full' : 'incremental'
      },
      fromCache: false
    }

    // Save data and metadata
    try {
      await this.storageManager.saveData(entries, analysis, currentFiles)
      console.log(`Data saved successfully: ${entries.length} entries`)
      
      await this.storageManager.saveMetadata({
        files: currentFiles,
        lastUpdate: new Date().toISOString(),
        totalEntries: entries.length
      })
      console.log('Metadata saved successfully')
      
      // Comment out saveAnalysisResult call
      // await this.storageManager.saveAnalysisResult(result)
      // console.log('Analysis result saved successfully')
    } catch (err) {
      console.error('Error saving data:', err)
    }

    console.log('=== Analysis Complete ===')
    console.log(`Total entries processed: ${entries.length}`)
    console.log(`Analysis generated at: ${result.metadata.lastUpdate}`)

    return result
  }

  /**
   * Handle analysis errors, try to return cached data
   * @param {Error} err - Error object
   * @returns {Object} Cached data or error information
   */
  async handleAnalysisError(err) {
    console.log('Analysis failed, attempting to load cached data...')
    
    try {
      const cachedData = await this.storageManager.loadStoredData()
      
      if (cachedData.entries && cachedData.entries.length > 0) {
        console.log(`Loaded ${cachedData.entries.length} cached entries`)
        console.log('Returning cached data due to analysis error')
        
        return {
          ...cachedData,
          entries: cachedData.entries.slice(0, 10000),
          fromCache: true,
          error: err.message,
          lastUpdate: cachedData.lastUpdate ? new Date(cachedData.lastUpdate).toISOString() : null
        }
      }
    } catch (cacheErr) {
      console.error('Failed to load cached data:', cacheErr)
    }

    // If cached data loading fails, return empty result
    return {
      entries: [],
      analysis: {
        totalCommands: 0,
        uniqueCommands: 0,
        activeDays: 0,
        shells: {},
        topCommands: [],
        commandsByHour: new Array(24).fill(0),
        commandsByDay: new Array(7).fill(0)
      },
      metadata: {
        totalEntries: 0,
        lastUpdate: new Date().toISOString(),
        error: err.message
      },
      fromCache: false,
      error: err.message
    }
  }

  /**
   * Force refresh analysis data
   * @returns {Object} Refreshed analysis result
   */
  async forceRefresh() {
    console.log('Force refreshing shell history analysis...')
    
    try {
      // Clear cache
      await this.storageManager.clearCache()
      
      // Perform full analysis
      return await this.performFullAnalysis()
    } catch (err) {
      console.error('Error in force refresh:', err)
      throw err
    }
  }

  /**
   * Get cache information
   * @returns {Object} Cache information
   */
  async getCacheInfo() {
    return await this.storageManager.getCacheInfo()
  }

  /**
   * Clear all cached data
   * @returns {Object} Clear operation result
   */
  async clearCache() {
    try {
      console.log('Clearing all cache data...')
      
      const result = await this.storageManager.clearAllData()
      
      console.log('Cache cleared successfully')
      return result
    } catch (err) {
      console.error('Failed to clear cache:', err)
      throw err
    }
  }

  /**
   * Get file status information
   * @returns {Object} File status information
   */
  async getFileStatus() {
    return await this.fileReader.getAllFileStatus()
  }
}
