/**
 * File reading service module
 * Responsible for reading and parsing history record files of different Shells
 * Supports multiple Shells such as Bash, Zsh, Fish
 */

import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { parseShellEntry } from '../parsers/shellParsers.js'

export class FileReaderService {
  constructor() {
    this.homeDir = os.homedir()
    this.currentShell = this.detectCurrentShell()
    this.historyFiles = this.getHistoryFiles()
    console.log('FileReaderService initialized')
    console.log('Current shell detected:', this.currentShell)
  }

  /**
   * Detect the Shell used by the current user
   * @returns {string} Current Shell type
   */
  detectCurrentShell() {
    // Detect from environment variables
    const shellEnv = process.env.SHELL
    if (shellEnv) {
      if (shellEnv.includes('zsh')) return 'zsh'
      if (shellEnv.includes('bash')) return 'bash'
      if (shellEnv.includes('fish')) return 'fish'
    }
    
    // Detect from process arguments
    const parentProcess = process.env._ || ''
    if (parentProcess.includes('zsh')) return 'zsh'
    if (parentProcess.includes('bash')) return 'bash'
    if (parentProcess.includes('fish')) return 'fish'
    
    // Default assume zsh (macOS default)
    return 'zsh'
  }

  /**
   * Get all supported Shell history file paths
   * Dynamically detect various possible history file locations
   * @returns {Object} Mapping from Shell type to file path
   */
  getHistoryFiles() {
    const historyFiles = {}
    
    // Get history file paths from environment variables
    const histFile = process.env.HISTFILE
    const bashHistFile = process.env.BASH_HISTORY
    
    // Bash history file candidate locations
    const bashCandidates = [
      bashHistFile,
      path.join(this.homeDir, '.bash_history'),
      path.join(this.homeDir, '.history')
    ].filter(Boolean)
    
    // Zsh history file candidate locations  
    const zshCandidates = [
      histFile,
      path.join(this.homeDir, '.zsh_history'),
      path.join(this.homeDir, '.zhistory'),
      path.join(this.homeDir, '.history')
    ].filter(Boolean)
    
    // Fish history file candidate locations
    const fishCandidates = [
      path.join(this.homeDir, '.local/share/fish/fish_history'),
      path.join(this.homeDir, '.config/fish/fish_history')
    ]
    
    // Select the first existing file for each shell
    historyFiles.bash = bashCandidates[0] || path.join(this.homeDir, '.bash_history')
    historyFiles.zsh = zshCandidates[0] || path.join(this.homeDir, '.zsh_history')  
    historyFiles.fish = fishCandidates[0]
    
    console.log('Detected shell history files:', historyFiles)
    return historyFiles
  }

  /**
   * Check if file exists and get file information
   * @param {string} filePath - File path
   * @returns {Object} File information object
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath)
      return {
        exists: true,
        size: stats.size,
        mtime: stats.mtime.getTime(),
        path: filePath,
        readable: true
      }
    } catch (err) {
      // Try to check if file is readable
      let readable = false
      try {
        await fs.access(filePath, fs.constants.R_OK)
        readable = true
      } catch (accessErr) {
        // File does not exist or is not readable
      }
      
      return {
        exists: false,
        size: 0,
        mtime: 0,
        path: filePath,
        readable,
        error: err.message,
        code: err.code
      }
    }
  }

  /**
   * Get current status of all history files
   * Including detection of all possible history file locations
   * @returns {Object} Status information for all files
   */
  async getAllFileStatus() {
    const status = {
      configured: {},
      detected: {},
      summary: {
        totalFiles: 0,
        existingFiles: 0,
        readableFiles: 0
      }
    }
    
    // Check configured files
    for (const [shell, filePath] of Object.entries(this.historyFiles)) {
      const fileInfo = await this.getFileInfo(filePath)
      status.configured[shell] = fileInfo
      
      if (fileInfo.exists) status.summary.existingFiles++
      if (fileInfo.readable) status.summary.readableFiles++
      status.summary.totalFiles++
    }
    
    // Detect other possible history files
    const additionalPaths = [
      path.join(this.homeDir, '.history'),
      path.join(this.homeDir, '.zhistory'),
      path.join(this.homeDir, '.config/fish/fish_history'),
      path.join(this.homeDir, '.sh_history')
    ]
    
    for (const additionalPath of additionalPaths) {
      // Avoid duplicate checks of already configured files
      if (!Object.values(this.historyFiles).includes(additionalPath)) {
        const fileInfo = await this.getFileInfo(additionalPath)
        if (fileInfo.exists) {
          status.detected[additionalPath] = fileInfo
        }
      }
    }
    
    console.log('File status summary:', status.summary)
    return status
  }

  /**
   * Read history file for specified Shell
   * @param {string} shell - Shell type ('bash', 'zsh', 'fish')
   * @param {number} fromByte - Starting byte position for reading (for incremental reads)
   * @returns {Array} Array of parsed history entries
   */
  async readShellHistory(shell, fromByte = 0) {
    const filePath = this.historyFiles[shell]
    
    if (!filePath) {
      throw new Error(`Unsupported shell: ${shell}`)
    }

    console.log(`Reading ${shell} history from: ${filePath}`)
    
    try {
      // Check if file exists and is readable
      const fileInfo = await this.getFileInfo(filePath)
      if (!fileInfo.exists) {
        console.log(`History file not found for ${shell}: ${filePath}`)
        return []
      }
      
      if (!fileInfo.readable) {
        console.log(`History file not readable for ${shell}: ${filePath}`)
        return []
      }
      
      if (fileInfo.size === 0) {
        console.log(`History file is empty for ${shell}: ${filePath}`)
        return []
      }

      console.log(`File info for ${shell}:`, {
        size: fileInfo.size,
        lastModified: new Date(fileInfo.mtime).toISOString()
      })

      // Read file content
      const fileHandle = await fs.open(filePath, 'r')
      const stats = await fileHandle.stat()
      
      // Perform incremental read if start byte is specified and less than file size
      const startByte = Math.min(fromByte, stats.size)
      const readSize = stats.size - startByte
      
      if (readSize <= 0) {
        await fileHandle.close()
        console.log(`No new content to read for ${shell}`)
        return []
      }

      const buffer = Buffer.alloc(readSize)
      await fileHandle.read(buffer, 0, readSize, startByte)
      await fileHandle.close()

      const content = buffer.toString('utf8')
      const lines = content.split('\n').filter(line => line.trim().length > 0)

      console.log(`Processing ${lines.length} lines for ${shell} (${readSize} bytes)`)

      // Parse history entries
      const entries = []
      let index = 0
      let validEntries = 0
      let skippedEntries = 0

      while (index < lines.length) {
        const line = lines[index]
        
        try {
          const parseResult = parseShellEntry(shell, line, lines, index)
          
          if (parseResult.entry && parseResult.entry.command) {
            // Filter out invalid or empty commands
            const command = parseResult.entry.command.trim()
            if (command && command.length > 0 && !command.startsWith('#')) {
              entries.push({
                ...parseResult.entry,
                shell,
                rawLine: line
              })
              validEntries++
            } else {
              skippedEntries++
            }
          } else {
            skippedEntries++
          }
          
          index = parseResult.nextIndex + 1
        } catch (parseErr) {
          console.warn(`Error parsing line ${index} in ${shell}:`, parseErr.message)
          skippedEntries++
          index++
        }
      }

      console.log(`Successfully parsed ${validEntries} valid entries from ${shell} (skipped ${skippedEntries})`)
      return entries

    } catch (err) {
      console.error(`Error reading ${shell} history from ${filePath}:`, {
        error: err.message,
        code: err.code,
        stack: err.stack
      })
      return []
    }
  }

  /**
   * Read history files from all supported Shells
   * Prioritize reading the currently detected Shell, then read other Shells
   * @returns {Object} Object containing all Shell history data
   */
  async readAllShellHistory() {
    console.log('Reading history from all supported shells...')
    console.log('Environment info:', {
      shell: process.env.SHELL,
      histfile: process.env.HISTFILE,
      home: this.homeDir,
      currentShell: this.currentShell
    })
    
    const allHistory = {
      entries: [],
      shells: {},
      files: {},
      diagnostics: {}
    }

    const results = {}
    
    // First get all file status
    const fileStatus = await this.getAllFileStatus()
    allHistory.files = fileStatus

    // Sort Shells by priority (currently detected Shell first)
    const shellOrder = [this.currentShell, ...Object.keys(this.historyFiles).filter(s => s !== this.currentShell)]

    // Read history files for each Shell
    for (const shell of shellOrder) {
      console.log(`\n=== Processing ${shell} shell ===`)
      
      try {
        const startTime = Date.now()
        const entries = await this.readShellHistory(shell)
        const endTime = Date.now()
        
        results[shell] = {
          success: true,
          entryCount: entries.length,
          filePath: this.historyFiles[shell],
          processingTime: endTime - startTime,
          fileExists: fileStatus.configured[shell]?.exists || false,
          fileReadable: fileStatus.configured[shell]?.readable || false,
          fileSize: fileStatus.configured[shell]?.size || 0
        }
        
        allHistory.entries.push(...entries)
        allHistory.shells[shell] = entries.length
        
        // Add diagnostic information
        allHistory.diagnostics[shell] = {
          detectedAsCurrent: shell === this.currentShell,
          hasValidEntries: entries.length > 0,
          sampleEntry: entries[0] || null,
          recentEntries: entries.slice(0, 3)
        }
        
        console.log(`${shell}: ${entries.length} entries in ${endTime - startTime}ms`)
        
      } catch (err) {
        console.error(`Failed to read ${shell} history:`, err)
        results[shell] = {
          success: false,
          error: err.message,
          entryCount: 0,
          filePath: this.historyFiles[shell],
          fileExists: fileStatus.configured[shell]?.exists || false,
          fileReadable: fileStatus.configured[shell]?.readable || false
        }
        
        allHistory.shells[shell] = 0
        allHistory.diagnostics[shell] = {
          error: err.message,
          detectedAsCurrent: shell === this.currentShell
        }
      }
    }

    // Sort by timestamp (newest first)
    allHistory.entries.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })

    const summary = {
      totalEntries: allHistory.entries.length,
      shellsWithData: Object.keys(allHistory.shells).filter(s => allHistory.shells[s] > 0),
      primaryShell: this.currentShell,
      readAt: new Date().toISOString()
    }

    console.log('\n=== Reading Summary ===')
    console.log(`Total entries read: ${summary.totalEntries}`)
    console.log(`Shells with data: ${summary.shellsWithData.join(', ')}`)
    console.log(`Primary shell: ${summary.primaryShell}`)
    console.log('Shell reading results:', results)

    return {
      ...allHistory,
      readingResults: results,
      summary
    }
  }

  /**
   * Read specified byte range from a file
   * @param {string} filePath - File path
   * @param {number} startByte - Starting byte position
   * @param {number} endByte - Ending byte position (exclusive)
   * @returns {string} Content read from file
   */
  async readFileRange(filePath, startByte, endByte) {
    try {
      const fileHandle = await fs.open(filePath, 'r')
      const readSize = endByte - startByte
      const buffer = Buffer.alloc(readSize)
      
      await fileHandle.read(buffer, 0, readSize, startByte)
      await fileHandle.close()
      
      return buffer.toString('utf8')
    } catch (err) {
      console.error(`Error reading file range ${filePath}:`, err)
      throw err
    }
  }

  /**
   * Get line count of a file (for quick checks on large files)
   * @param {string} filePath - File path
   * @returns {number} Number of lines in file
   */
  async getFileLineCount(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      return content.split('\n').length
    } catch (err) {
      console.error(`Error counting lines in ${filePath}:`, err)
      return 0
    }
  }

  /**
   * Diagnose shell history configuration
   * Check various issues that may cause no data
   * @returns {Object} Diagnosis results
   */
  async diagnoseShellHistory() {
    console.log('Starting shell history diagnosis...')
    
    const diagnosis = {
      environment: {
        shell: process.env.SHELL,
        histfile: process.env.HISTFILE,
        histsize: process.env.HISTSIZE,
        histfilesize: process.env.HISTFILESIZE,
        home: this.homeDir,
        user: process.env.USER || process.env.USERNAME,
        detectedShell: this.currentShell
      },
      files: {},
      recommendations: []
    }

    // Check all possible history file locations
    const allPossiblePaths = [
      { path: process.env.HISTFILE, source: 'HISTFILE env var' },
      { path: path.join(this.homeDir, '.zsh_history'), source: 'default zsh' },
      { path: path.join(this.homeDir, '.bash_history'), source: 'default bash' },
      { path: path.join(this.homeDir, '.history'), source: 'generic history' },
      { path: path.join(this.homeDir, '.zhistory'), source: 'alternative zsh' },
      { path: path.join(this.homeDir, '.local/share/fish/fish_history'), source: 'fish default' },
      { path: path.join(this.homeDir, '.config/fish/fish_history'), source: 'fish alternative' },
      { path: path.join(this.homeDir, '.sh_history'), source: 'sh history' }
    ].filter(item => item.path)

    for (const { path: filePath, source } of allPossiblePaths) {
      try {
        const fileInfo = await this.getFileInfo(filePath)
        const lineCount = fileInfo.exists ? await this.getFileLineCount(filePath) : 0
        
        diagnosis.files[filePath] = {
          ...fileInfo,
          source,
          lineCount,
          isEmpty: lineCount === 0
        }
        
        if (fileInfo.exists && lineCount > 0) {
          console.log(`Found history file: ${filePath} (${lineCount} lines, ${source})`)
        }
      } catch (err) {
        diagnosis.files[filePath] = {
          exists: false,
          error: err.message,
          source
        }
      }
    }

    // Generate recommendations
    const existingFiles = Object.entries(diagnosis.files)
      .filter(([_, info]) => info.exists && info.lineCount > 0)
    
    if (existingFiles.length === 0) {
      diagnosis.recommendations.push('No shell history files found. Shell history may be disabled or not configured.')
      diagnosis.recommendations.push('Check if HISTFILE, HISTSIZE environment variables are set correctly.')
    } else {
      diagnosis.recommendations.push(`Found ${existingFiles.length} history file(s) with data.`)
      existingFiles.forEach(([path, info]) => {
        diagnosis.recommendations.push(`Use ${path} (${info.lineCount} lines, ${info.source})`)
      })
    }

    // Check current shell specific issues
    if (diagnosis.environment.detectedShell === 'zsh') {
      if (!diagnosis.environment.histfile) {
        diagnosis.recommendations.push('Consider setting HISTFILE environment variable for zsh.')
      }
    }

    console.log('Diagnosis complete:', diagnosis)
    return diagnosis
  }
}
