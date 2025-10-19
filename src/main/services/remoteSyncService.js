/**
 * Remote Sync Service
 * 处理远程服务器的连接、数据同步和合并
 * 支持 Mock 模式和真实 SSH 连接
 */

import { getMockDataGenerator } from './mockDataGenerator.js'
import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'

class RemoteSyncService {
  constructor() {
    this.mockDataGenerator = getMockDataGenerator()
    this.syncInProgress = new Map() // 跟踪正在同步的服务器
  }

  /**
   * 测试服务器连接
   */
  async testConnection(server) {
    console.log(`🔍 Testing connection to ${server.name} (${server.host})...`)

    // Mock 模式
    if (server.isMock) {
      return await this.testMockConnection(server)
    }

    // 真实 SSH 连接 (未来实现)
    return await this.testRealConnection(server)
  }

  /**
   * Mock 连接测试
   */
  async testMockConnection(server) {
    // 模拟网络延迟
    const delay = 500 + Math.random() * 1000
    await this.sleep(delay)

    // 模拟随机成功/失败
    const success = Math.random() > 0.1 // 90% 成功率

    if (success) {
      return {
        success: true,
        message: 'Connection successful',
        details: {
          hostname: server.host,
          username: server.username,
          shellTypes: server.shellTypes || ['bash', 'zsh'],
          homeDir: `/home/${server.username}`,
          latency: Math.round(delay)
        }
      }
    } else {
      throw new Error('Connection timeout - Mock failure for testing')
    }
  }

  /**
   * 真实 SSH 连接测试（未来实现）
   */
  async testRealConnection(server) {
    // TODO: 使用 ssh2 库实现真实连接
    throw new Error('Real SSH connection not implemented yet. Please enable Mock mode.')
  }

  /**
   * 同步服务器数据
   */
  async syncServer(server, progressCallback = null) {
    // 检查是否已经在同步
    if (this.syncInProgress.has(server.id)) {
      throw new Error('Sync already in progress for this server')
    }

    this.syncInProgress.set(server.id, true)

    try {
      console.log(`🔄 Starting sync for ${server.name}...`)

      // 进度回调
      const reportProgress = (stage, progress, message) => {
        if (progressCallback) {
          progressCallback({ stage, progress, message })
        }
      }

      // 阶段 1: 连接
      reportProgress('connecting', 10, 'Establishing connection...')
      const connectionInfo = await this.testConnection(server)
      
      if (!connectionInfo.success) {
        throw new Error('Failed to connect to server')
      }

      // 阶段 2: 发现文件
      reportProgress('discovering', 30, 'Discovering history files...')
      const historyFiles = await this.discoverHistoryFiles(server, connectionInfo)

      // 阶段 3: 下载数据
      reportProgress('downloading', 50, `Downloading ${historyFiles.length} file(s)...`)
      const historyData = await this.downloadHistoryFiles(server, historyFiles)

      // 阶段 4: 解析数据
      reportProgress('parsing', 70, 'Parsing command history...')
      const parsedCommands = await this.parseHistoryData(server, historyData)

      // 阶段 5: 保存缓存
      reportProgress('saving', 90, 'Saving to cache...')
      await this.saveRemoteCache(server, parsedCommands)

      // 完成
      reportProgress('completed', 100, `Synced ${parsedCommands.length} commands`)

      console.log(`✅ Sync completed for ${server.name}: ${parsedCommands.length} commands`)

      return {
        success: true,
        commandCount: parsedCommands.length,
        files: historyFiles,
        duration: Date.now() - Date.now() // TODO: 实际计算时间
      }
    } catch (error) {
      console.error(`❌ Sync failed for ${server.name}:`, error)
      throw error
    } finally {
      this.syncInProgress.delete(server.id)
    }
  }

  /**
   * 发现历史文件
   */
  async discoverHistoryFiles(server, connectionInfo) {
    if (server.isMock) {
      return await this.discoverMockFiles(server, connectionInfo)
    }

    // TODO: 真实 SSH 文件发现
    throw new Error('Real SSH file discovery not implemented yet')
  }

  /**
   * Mock 文件发现
   */
  async discoverMockFiles(server, connectionInfo) {
    await this.sleep(300)

    const files = []
    const shellTypes = connectionInfo.details.shellTypes || ['bash']

    shellTypes.forEach((shellType) => {
      const filePath = this.getHistoryFilePath(shellType, connectionInfo.details.homeDir)
      files.push({
        path: filePath,
        shellType,
        size: Math.floor(Math.random() * 1000000) + 10000 // 10KB - 1MB
      })
    })

    return files
  }

  /**
   * 获取历史文件路径
   */
  getHistoryFilePath(shellType, homeDir) {
    const paths = {
      bash: `${homeDir}/.bash_history`,
      zsh: `${homeDir}/.zsh_history`,
      fish: `${homeDir}/.local/share/fish/fish_history`
    }
    return paths[shellType] || paths.bash
  }

  /**
   * 下载历史文件
   */
  async downloadHistoryFiles(server, files) {
    if (server.isMock) {
      return await this.downloadMockFiles(server, files)
    }

    // TODO: 真实 SFTP 下载
    throw new Error('Real SFTP download not implemented yet')
  }

  /**
   * Mock 文件下载 - 生成模拟数据
   */
  async downloadMockFiles(server, files) {
    // 模拟下载延迟
    await this.sleep(800)

    const historyData = []

    for (const file of files) {
      // 生成随机数量的命令 (200-1000)
      const commandCount = Math.floor(Math.random() * 800) + 200

      // 生成历史记录
      const content = this.mockDataGenerator.generateHistory({
        count: commandCount,
        shellType: file.shellType,
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60天前
        endDate: new Date()
      })

      historyData.push({
        file: file.path,
        shellType: file.shellType,
        content,
        size: content.length
      })
    }

    return historyData
  }

  /**
   * 解析历史数据
   */
  async parseHistoryData(server, historyData) {
    const allCommands = []

    for (const data of historyData) {
      const commands = this.parseShellHistory(data.content, data.shellType)

      // 添加来源信息
      commands.forEach((cmd) => {
        cmd.source = 'remote'
        cmd.serverId = server.id
        cmd.serverName = server.name
        cmd.filePath = data.file
      })

      allCommands.push(...commands)
    }

    // 按时间戳排序
    allCommands.sort((a, b) => a.timestamp - b.timestamp)

    return allCommands
  }

  /**
   * 解析 Shell 历史记录
   */
  parseShellHistory(content, shellType) {
    const lines = content.split('\n').filter((line) => line.trim())

    switch (shellType) {
      case 'bash':
        return this.parseBash(lines)
      case 'zsh':
        return this.parseZsh(lines)
      case 'fish':
        return this.parseFish(content)
      default:
        return this.parseBash(lines)
    }
  }

  /**
   * 解析 Bash 历史
   */
  parseBash(lines) {
    return lines.map((line, index) => ({
      command: line.trim(),
      timestamp: Date.now() - (lines.length - index) * 1000, // 简单时间戳
      shell: 'bash'
    }))
  }

  /**
   * 解析 Zsh 历史
   */
  parseZsh(lines) {
    return lines
      .map((line) => {
        // 格式: : timestamp:0;command
        const match = line.match(/^: (\d+):\d+;(.+)$/)
        if (match) {
          return {
            command: match[2].trim(),
            timestamp: parseInt(match[1]) * 1000,
            shell: 'zsh'
          }
        }
        return null
      })
      .filter((cmd) => cmd !== null)
  }

  /**
   * 解析 Fish 历史
   */
  parseFish(content) {
    const commands = []
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('- cmd:')) {
        const cmd = line.replace('- cmd:', '').trim()
        const nextLine = lines[i + 1]?.trim()

        let timestamp = Date.now()
        if (nextLine && nextLine.startsWith('when:')) {
          timestamp = parseInt(nextLine.replace('when:', '').trim()) * 1000
        }

        commands.push({
          command: cmd,
          timestamp,
          shell: 'fish'
        })
      }
    }

    return commands
  }

  /**
   * 保存远程缓存
   */
  async saveRemoteCache(server, commands) {
    const cachePath = path.join(
      app.getPath('userData'),
      `remote-cache-${server.id}.json`
    )

    const cacheData = {
      serverId: server.id,
      serverName: server.name,
      syncTime: new Date().toISOString(),
      commandCount: commands.length,
      commands
    }

    await fs.writeFile(cachePath, JSON.stringify(cacheData, null, 2), 'utf-8')

    console.log(`💾 Saved remote cache for ${server.name}: ${commands.length} commands`)
  }

  /**
   * 读取远程缓存
   */
  async loadRemoteCache(serverId) {
    const cachePath = path.join(app.getPath('userData'), `remote-cache-${serverId}.json`)

    try {
      const data = await fs.readFile(cachePath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null // 缓存不存在
      }
      throw error
    }
  }

  /**
   * 删除远程缓存
   */
  async deleteRemoteCache(serverId) {
    const cachePath = path.join(app.getPath('userData'), `remote-cache-${serverId}.json`)

    try {
      await fs.unlink(cachePath)
      console.log(`🗑️ Deleted remote cache for server: ${serverId}`)
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }

  /**
   * 获取所有远程缓存的统计信息
   */
  async getAllRemoteCacheStats() {
    const userDataPath = app.getPath('userData')
    const files = await fs.readdir(userDataPath)

    const cacheFiles = files.filter((file) => file.startsWith('remote-cache-'))
    const stats = []

    for (const file of cacheFiles) {
      try {
        const cachePath = path.join(userDataPath, file)
        const data = await fs.readFile(cachePath, 'utf-8')
        const cache = JSON.parse(data)

        stats.push({
          serverId: cache.serverId,
          serverName: cache.serverName,
          commandCount: cache.commandCount,
          syncTime: cache.syncTime
        })
      } catch (error) {
        console.error(`Failed to read cache file ${file}:`, error)
      }
    }

    return stats
  }

  /**
   * 工具函数：Sleep
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// 导出单例
let instance = null

export function getRemoteSyncService() {
  if (!instance) {
    instance = new RemoteSyncService()
  }
  return instance
}

export default RemoteSyncService
