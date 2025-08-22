/**
 * Data storage module
 * Responsible for managing persistent storage of Shell history records
 * Including cache management, metadata management and incremental update support
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'

export class DataStorageManager {
  constructor() {
    this.userHome = os.homedir()

    // Data storage path configuration
    this.dataDir = path.join(this.userHome, '.termlytic')
    this.dataFile = path.join(this.dataDir, 'history_data.json')
    this.metaFile = path.join(this.dataDir, 'metadata.json')

    // Initialize storage directory
    this.initializeStorage()
  }

  /**
   * Initialize storage directory
   * Create necessary directory structure
   */
  async initializeStorage() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true })
      console.log(`Storage directory initialized: ${this.dataDir}`)
    } catch (err) {
      console.error('Failed to create data directory:', err)
      throw err
    }
  }

  /**
   * Get file metadata information
   * @param {string} filePath - File path
   * @returns {Object} Object containing file size, modification time and existence status
   */
  async getFileMetadata(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return {
        size: stats.size,
        mtime: stats.mtime.getTime(), // Timestamp of modification time
        exists: true
      }
    } catch (err) {
      // File does not exist or cannot be accessed
      return {
        size: 0,
        mtime: 0,
        exists: false
      }
    }
  }

  /**
   * Read stored metadata
   * Metadata contains last update time, file status and other information
   * @returns {Object} Metadata object
   */
  async loadMetadata() {
    try {
      const data = await fs.readFile(this.metaFile, 'utf-8')
      return JSON.parse(data)
    } catch (err) {
      // File does not exist or format error, return default value
      console.log('No existing metadata found, creating default')
      return {
        lastUpdate: 0,
        files: {},
        version: '1.0'
      }
    }
  }

  /**
   * Save metadata to file
   * @param {Object} metadata - Metadata to save
   */
  async saveMetadata(metadata) {
    try {
      const dataToSave = {
        ...metadata,
        lastSaved: Date.now() // Add save timestamp
      }
      await fs.writeFile(this.metaFile, JSON.stringify(dataToSave, null, 2))
      console.log('Metadata saved successfully')
    } catch (err) {
      console.error('Failed to save metadata:', err)
      throw err
    }
  }

  /**
   * Read stored history data
   * @returns {Object} Object containing history records and analysis results
   */
  async loadStoredData() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8')
      const parsed = JSON.parse(data)
      console.log(`Loaded ${parsed.entries?.length || 0} cached entries`)
      return parsed
    } catch (err) {
      console.log('No existing data found, starting fresh')
      return {
        entries: [],
        analysis: null,
        lastUpdate: 0
      }
    }
  }

  /**
   * Save history data to file
   * @param {Array} entries - Array of history record entries
   * @param {Object} analysis - Analysis result object
   * @param {Object} fileInfo - File information object
   */
  async saveData(entries, analysis, fileInfo) {
    try {
      const dataToSave = {
        entries: entries,
        analysis: analysis,
        metadata: {
          files: fileInfo,
          lastUpdate: new Date().toISOString(),
          totalEntries: entries.length
        },
        savedAt: new Date().toISOString() // Add save time
      }
      await fs.writeFile(this.dataFile, JSON.stringify(dataToSave, null, 2))
      console.log(`Data saved successfully: ${entries?.length || 0} entries`)
    } catch (err) {
      console.error('Failed to save data:', err)
      throw err
    }
  }

  /**
   * Check if incremental update is needed
   * Compare current file status with last recorded status
   * @param {Object} historyFiles - Shell history file path mapping
   * @returns {Object} Object containing update status and file information
   */
  async needsUpdate(historyFiles) {
    const metadata = await this.loadMetadata()
    const currentFiles = {}
    let needsUpdate = false

    console.log('Checking for file changes...')

    for (const [shell, filePath] of Object.entries(historyFiles)) {
      const currentMeta = await this.getFileMetadata(filePath)
      currentFiles[shell] = currentMeta

      const lastMeta = metadata.files[shell] || { size: 0, mtime: 0 }

      // Check if file has changed
      if (
        currentMeta.exists &&
        (currentMeta.size !== lastMeta.size || currentMeta.mtime !== lastMeta.mtime)
      ) {
        console.log(`File changed: ${shell} (${filePath})`)
        console.log(`  Size: ${lastMeta.size} -> ${currentMeta.size}`)
        console.log(`  MTime: ${lastMeta.mtime} -> ${currentMeta.mtime}`)
        needsUpdate = true
      }
    }

    return {
      needsUpdate,
      currentFiles,
      metadata
    }
  }

  /**
   * Read incremental content of file
   * Only read content added since last update
   * @param {string} filePath - File path
   * @param {number} lastSize - Last recorded file size
   * @returns {string} New file content added
   */
  async readIncrementalContent(filePath, lastSize) {
    try {
      const data = await fs.readFile(filePath, 'utf-8')

      if (lastSize >= data.length) {
        return '' // File became smaller or no change
      }

      // Read new content
      const newContent = data.substring(lastSize)
      console.log(`Read ${newContent.split('\\n').length} new lines from ${filePath}`)
      return newContent
    } catch (err) {
      console.error(`Failed to read incremental content from ${filePath}:`, err)
      return ''
    }
  }

  /**
   * Clear all cached data
   * Used to force complete rescan
   */
  async clearCache() {
    try {
      await fs.unlink(this.dataFile)
      console.log('Data cache cleared')
    } catch (err) {
      // File does not exist, ignore error
    }

    try {
      await fs.unlink(this.metaFile)
      console.log('Metadata cache cleared')
    } catch (err) {
      // File does not exist, ignore error
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache information object
   */
  async getCacheInfo() {
    try {
      const metadata = await this.loadMetadata()
      const dataExists = await this.getFileMetadata(this.dataFile)
      
      // Get data entry count
      let entryCount = 0
      if (dataExists.exists) {
        try {
          const data = await this.loadStoredData()
          entryCount = data.entries ? data.entries.length : 0
        } catch (err) {
          console.log('Could not read data file for entry count:', err.message)
        }
      }

      return {
        hasCache: dataExists.exists,
        lastUpdate: metadata.lastUpdate ? new Date(metadata.lastUpdate).toISOString() : null,
        files: metadata.files || {},
        size: dataExists.size || 0,
        entries: entryCount,
        dataFile: this.dataFile,
        metaFile: this.metaFile
      }
    } catch (err) {
      console.error('DataStorage: getCacheInfo error:', err)
      return {
        hasCache: false,
        error: err.message,
        entries: 0,
        size: 0
      }
    }
  }

  /**
   * Clear all cached data和元数据
   * @returns {Object} Clear operation result
   */
  async clearAllData() {
    const results = {
      dataDeleted: false,
      metadataDeleted: false,
      errors: []
    }

    try {
      // Delete data file
      try {
        await fs.unlink(this.dataFile)
        results.dataDeleted = true
        console.log('Data file deleted successfully')
      } catch (err) {
        if (err.code !== 'ENOENT') {
          results.errors.push(`Failed to delete data file: ${err.message}`)
        }
      }

      // Delete metadata file
      try {
        await fs.unlink(this.metaFile)
        results.metadataDeleted = true
        console.log('Metadata file deleted successfully')
      } catch (err) {
        if (err.code !== 'ENOENT') {
          results.errors.push(`Failed to delete metadata file: ${err.message}`)
        }
      }

      // Check if there are errors
      if (results.errors.length > 0) {
        throw new Error(results.errors.join('; '))
      }

      return {
        success: true,
        message: 'All cache data cleared successfully',
        ...results
      }
    } catch (err) {
      console.error('Error clearing cache data:', err)
      return {
        success: false,
        error: err.message,
        ...results
      }
    }
  }
}
