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
   * 获取所有历史文件的当前状态
   * 包括检测所有可能的历史文件位置
   * @returns {Object} 所有文件的状态信息
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
    
    // 检查配置的文件
    for (const [shell, filePath] of Object.entries(this.historyFiles)) {
      const fileInfo = await this.getFileInfo(filePath)
      status.configured[shell] = fileInfo
      
      if (fileInfo.exists) status.summary.existingFiles++
      if (fileInfo.readable) status.summary.readableFiles++
      status.summary.totalFiles++
    }
    
    // 检测其他可能的历史文件
    const additionalPaths = [
      path.join(this.homeDir, '.history'),
      path.join(this.homeDir, '.zhistory'),
      path.join(this.homeDir, '.config/fish/fish_history'),
      path.join(this.homeDir, '.sh_history')
    ]
    
    for (const additionalPath of additionalPaths) {
      // 避免重复检查已配置的文件
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
   * 读取指定 Shell 的历史文件
   * @param {string} shell - Shell 类型 ('bash', 'zsh', 'fish')
   * @param {number} fromByte - 从第几个字节开始读取（用于增量读取）
   * @returns {Array} 解析后的历史条目数组
   */
  async readShellHistory(shell, fromByte = 0) {
    const filePath = this.historyFiles[shell]
    
    if (!filePath) {
      throw new Error(`Unsupported shell: ${shell}`)
    }

    console.log(`Reading ${shell} history from: ${filePath}`)
    
    try {
      // 检查文件是否存在和可读
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

      // 读取文件内容
      const fileHandle = await fs.open(filePath, 'r')
      const stats = await fileHandle.stat()
      
      // 如果指定了起始字节且小于文件大小，进行增量读取
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

      // 解析历史条目
      const entries = []
      let index = 0
      let validEntries = 0
      let skippedEntries = 0

      while (index < lines.length) {
        const line = lines[index]
        
        try {
          const parseResult = parseShellEntry(shell, line, lines, index)
          
          if (parseResult.entry && parseResult.entry.command) {
            // 过滤掉无效或空的命令
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
   * 读取所有支持的 Shell 历史文件
   * 优先读取当前检测到的 Shell，然后读取其他 Shell
   * @returns {Object} 包含所有 Shell 历史数据的对象
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
    
    // 首先获取所有文件状态
    const fileStatus = await this.getAllFileStatus()
    allHistory.files = fileStatus

    // 按优先级排序 Shell（当前检测到的 Shell 优先）
    const shellOrder = [this.currentShell, ...Object.keys(this.historyFiles).filter(s => s !== this.currentShell)]

    // 读取各个 Shell 的历史文件
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
        
        // 添加诊断信息
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
   * 读取指定文件的指定字节范围
   * @param {string} filePath - File path
   * @param {number} startByte - 起始字节
   * @param {number} endByte - 结束字节（不包含）
   * @returns {string} 读取的内容
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
   * 获取文件的行数（用于大文件的快速检查）
   * @param {string} filePath - File path
   * @returns {number} 文件行数
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
   * 诊断 shell 历史配置
   * 检查各种可能导致无数据的问题
   * @returns {Object} 诊断结果
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

    // 检查所有可能的历史文件位置
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

    // 生成建议
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

    // 检查当前 shell 特定的问题
    if (diagnosis.environment.detectedShell === 'zsh') {
      if (!diagnosis.environment.histfile) {
        diagnosis.recommendations.push('Consider setting HISTFILE environment variable for zsh.')
      }
    }

    console.log('Diagnosis complete:', diagnosis)
    return diagnosis
  }
}
