/**
 * Remote Server Manager
 * Manages CRUD operations for remote server configurations
 * Supports Mock mode for local testing
 */

import { app } from 'electron'
import path from 'path'
import fs from 'fs/promises'

class RemoteServerManager {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'remote-servers.json')
    this.servers = []
    this.mockMode = true // Enable Mock mode by default for easy testing
  }

  /**
   * Initialize - Load server configurations
   */
  async initialize() {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8')
      this.servers = JSON.parse(data)
      console.log(`📡 Loaded ${this.servers.length} remote servers`)
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create default configuration (with Mock servers)
        this.servers = this.getDefaultMockServers()
        await this.saveServers()
        console.log('📡 Created default remote server configuration with mock servers')
      } else {
        console.error('❌ Failed to load remote servers:', error)
        this.servers = []
      }
    }
  }

  /**
   * Get default Mock server configuration (for testing)
   */
  getDefaultMockServers() {
    return [
      {
        id: 'mock-prod-1',
        name: '🧪 Mock Production Server',
        host: 'prod.example.com',
        port: 22,
        username: 'admin',
        authType: 'key',
        enabled: true,
        isMock: true,
        lastSync: null,
        status: 'never_synced',
        commandCount: 0,
        shellTypes: ['bash', 'zsh'],
        description: 'Mock server for testing - generates realistic command history',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-dev-1',
        name: '🧪 Mock Development Server',
        host: 'dev.example.com',
        port: 22,
        username: 'developer',
        authType: 'password',
        enabled: false,
        isMock: true,
        lastSync: null,
        status: 'disabled',
        commandCount: 0,
        shellTypes: ['bash'],
        description: 'Mock dev server - disabled by default',
        createdAt: new Date().toISOString()
      }
    ]
  }

  /**
   * Save server configuration to file
   */
  async saveServers() {
    try {
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.servers, null, 2),
        'utf-8'
      )
      console.log('💾 Saved remote server configuration')
      return { success: true }
    } catch (error) {
      console.error('❌ Failed to save remote servers:', error)
      throw new Error(`Failed to save server configuration: ${error.message}`)
    }
  }

  /**
   * Get all servers list (without sensitive information)
   */
  getAllServers() {
    return this.servers.map((server) => this.sanitizeServer(server))
  }

  /**
   * Get server by ID
   */
  getServerById(serverId) {
    const server = this.servers.find((s) => s.id === serverId)
    if (!server) {
      throw new Error(`Server not found: ${serverId}`)
    }
    return this.sanitizeServer(server)
  }

  /**
   * Sanitize sensitive information
   */
  sanitizeServer(server) {
    return {
      ...server,
      password: undefined,
      privateKey: undefined
    }
  }

  /**
   * Add new server
   */
  async addServer(serverConfig) {
    // Validate required fields
    if (!serverConfig.name || !serverConfig.host || !serverConfig.username) {
      throw new Error('Missing required fields: name, host, username')
    }

    // Check for duplicates
    const exists = this.servers.some(
      (s) => s.host === serverConfig.host && s.username === serverConfig.username
    )
    if (exists) {
      throw new Error('Server with same host and username already exists')
    }

    const newServer = {
      id: `server-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: serverConfig.name,
      host: serverConfig.host,
      port: serverConfig.port || 22,
      username: serverConfig.username,
      authType: serverConfig.authType || 'password',
      password: serverConfig.password,
      privateKey: serverConfig.privateKey,
      privateKeyPath: serverConfig.privateKeyPath,
      enabled: serverConfig.enabled !== false,
      isMock: serverConfig.isMock || false,
      lastSync: null,
      status: 'never_synced',
      commandCount: 0,
      shellTypes: serverConfig.shellTypes || ['bash'],
      description: serverConfig.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.servers.push(newServer)
    await this.saveServers()

    console.log(`✅ Added server: ${newServer.name} (${newServer.id})`)
    return this.sanitizeServer(newServer)
  }

  /**
   * Update server configuration
   */
  async updateServer(serverId, updates) {
    const index = this.servers.findIndex((s) => s.id === serverId)
    if (index === -1) {
      throw new Error(`Server not found: ${serverId}`)
    }

    // Disallow modification of certain fields
    const protectedFields = ['id', 'createdAt', 'isMock']
    protectedFields.forEach((field) => {
      if (field in updates) {
        delete updates[field]
      }
    })

    this.servers[index] = {
      ...this.servers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await this.saveServers()

    console.log(`✅ Updated server: ${serverId}`)
    return this.sanitizeServer(this.servers[index])
  }

  /**
   * Delete server
   */
  async deleteServer(serverId) {
    const index = this.servers.findIndex((s) => s.id === serverId)
    if (index === -1) {
      throw new Error(`Server not found: ${serverId}`)
    }

    const server = this.servers[index]
    this.servers.splice(index, 1)
    await this.saveServers()

    console.log(`✅ Deleted server: ${server.name} (${serverId})`)
    return { success: true, deletedServer: this.sanitizeServer(server) }
  }

  /**
   * Enable/Disable server
   */
  async toggleServer(serverId, enabled) {
    return await this.updateServer(serverId, { enabled })
  }

  /**
   * Update server sync status
   */
  async updateSyncStatus(serverId, status, commandCount = null) {
    const updates = {
      status,
      lastSync: new Date().toISOString()
    }

    if (commandCount !== null) {
      updates.commandCount = commandCount
    }

    return await this.updateServer(serverId, updates)
  }

  /**
   * Get enabled servers list
   */
  getEnabledServers() {
    return this.servers.filter((s) => s.enabled).map((s) => this.sanitizeServer(s))
  }

  /**
   * Get Mock servers list
   */
  getMockServers() {
    return this.servers.filter((s) => s.isMock).map((s) => this.sanitizeServer(s))
  }

  /**
   * Get real servers list
   */
  getRealServers() {
    return this.servers.filter((s) => !s.isMock).map((s) => this.sanitizeServer(s))
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      total: this.servers.length,
      enabled: this.servers.filter((s) => s.enabled).length,
      mock: this.servers.filter((s) => s.isMock).length,
      real: this.servers.filter((s) => !s.isMock).length,
      synced: this.servers.filter((s) => s.lastSync !== null).length,
      totalCommands: this.servers.reduce((sum, s) => sum + s.commandCount, 0)
    }
  }
}

// Singleton pattern
let instance = null

export function getRemoteServerManager() {
  if (!instance) {
    instance = new RemoteServerManager()
  }
  return instance
}

export default RemoteServerManager
