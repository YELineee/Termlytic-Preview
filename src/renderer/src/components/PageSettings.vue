<template>
  <div class="settings-wrapper">
    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Application Info Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>APPLICATION INFORMATION</h2>
        </div>
        <div class="card-body">
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Version</div>
              <div class="info-value">v1.0.0</div>
            </div>
            <div class="info-item">
              <div class="info-label">Data Directory</div>
              <div class="info-value">~/.termlytic</div>
            </div>
            <div class="info-item">
              <div class="info-label">Cache Status</div>
              <div class="info-value">{{ cacheInfo.status }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Last Updated</div>
              <div class="info-value">{{ cacheInfo.lastUpdate }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cache Management Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>CACHE MANAGEMENT</h2>
        </div>
        <div class="card-body">
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-label">Entries</div>
              <div class="stat-value">{{ cacheInfo.entries }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Size</div>
              <div class="stat-value">{{ cacheInfo.size }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">Last Update</div>
              <div class="stat-value">{{ cacheInfo.lastUpdate }}</div>
            </div>
          </div>

          <div class="action-row">
            <button
              @click="refreshCacheInfo"
              :disabled="isRefreshing"
              class="btn btn-secondary"
            >
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
              <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
            </button>
            <button @click="clearCache" :disabled="isClearing" class="btn btn-danger">
              <i class="fas fa-trash-alt" :class="{ 'fa-spin fa-spinner': isClearing }"></i>
              <span>{{ isClearing ? 'Clearing...' : 'Clear Cache' }}</span>
            </button>
          </div>

          <div class="warning-notice">
            <i class="fas fa-exclamation-triangle"></i>
            <div>
              <strong>Warning:</strong> Clearing cache will remove all analyzed data and require
              re-analysis on next startup.
            </div>
          </div>
        </div>
      </div>

      <!-- Remote Servers Card -->
      <div class="settings-card remote-servers-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>REMOTE SERVERS</h2>
        </div>
        <div class="card-body">
          <p class="description">
            Manage remote server connections to sync shell history data from your servers.
            Use Mock mode to test without real servers.
          </p>

          <div v-if="remoteServers.length === 0" class="empty-state">
            <div class="empty-icon">🖥️</div>
            <h3>No Remote Servers</h3>
            <p>Add your first remote server to start syncing command history.</p>
            <button @click="showAddServerDialog" class="btn btn-primary">
              <i class="fas fa-plus"></i>
              <span>Add Server</span>
            </button>
          </div>

          <div v-else class="servers-list">
            <div class="servers-header">
              <button @click="showAddServerDialog" class="btn btn-primary btn-sm">
                <i class="fas fa-plus"></i>
                <span>Add Server</span>
              </button>
              <div class="servers-stats">
                <span>{{ remoteServersStats.total }} Total</span>
                <span>{{ remoteServersStats.enabled }} Enabled</span>
                <span>{{ remoteServersStats.synced }} Synced</span>
              </div>
            </div>

            <div class="servers-grid">
              <RemoteServerCard
                v-for="server in remoteServers"
                :key="server.id"
                :server="server"
                @edit="editServer"
                @delete="deleteServer"
                @toggle="toggleServer"
                @test="testConnection"
                @sync="syncServer"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div v-if="message" class="message-toast" :class="`toast-${message.type}`">
        <i
          :class="{
            'fas fa-check-circle': message.type === 'success',
            'fas fa-exclamation-circle': message.type === 'error'
          }"
        ></i>
        <span>{{ message.text }}</span>
        <button @click="message = null" class="toast-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Shell History Diagnosis Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>SHELL HISTORY DIAGNOSIS</h2>
        </div>
        <div class="card-body">
          <p class="description">
            If the application shows "No Data", run a diagnosis to check your shell configuration
            and history file status.
          </p>

          <button @click="runDiagnosis" :disabled="isDiagnosing" class="btn btn-primary">
            <i class="fas" :class="isDiagnosing ? 'fa-spinner fa-spin' : 'fa-search'"></i>
            <span>{{ isDiagnosing ? 'Diagnosing...' : 'Run Diagnosis' }}</span>
          </button>


          <div v-if="diagnosisResult" class="diagnosis-results">
            <div class="result-section">
              <h4 class="result-title">Environment Information</h4>
              <div class="info-grid-small">
                <div class="info-row">
                  <span class="info-label">Current Shell</span>
                  <span class="info-value">{{ diagnosisResult.environment.detectedShell }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">SHELL Variable</span>
                  <span class="info-value">{{ diagnosisResult.environment.shell || 'Not set' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">HISTFILE</span>
                  <span class="info-value">{{ diagnosisResult.environment.histfile || 'Not set' }}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">User</span>
                  <span class="info-value">{{ diagnosisResult.environment.user }}</span>
                </div>
              </div>
            </div>

            <div class="result-section">
              <h4 class="result-title">History File Status</h4>
              <div class="file-list">
                <div v-for="(fileInfo, filePath) in diagnosisResult.files" :key="filePath" class="file-item">
                  <div class="file-path">
                    <span class="path-text">{{ filePath }}</span>
                    <span class="path-source">{{ fileInfo.source }}</span>
                  </div>
                  <div class="file-status" :class="{ 'status-exists': fileInfo.exists }">
                    <i :class="fileInfo.exists ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    <span v-if="fileInfo.exists">Exists ({{ fileInfo.lineCount }} lines)</span>
                    <span v-else>Not Found</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="diagnosisResult.recommendations?.length" class="result-section">
              <h4 class="result-title">Recommendations</h4>
              <ul class="recommendation-list">
                <li v-for="(recommendation, index) in diagnosisResult.recommendations" :key="index">
                  <span>{{ recommendation }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>


      <!-- Performance Settings Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>PERFORMANCE</h2>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Enable Animations</label>
              <p class="setting-desc">Toggle UI animations and transitions</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Hardware Acceleration</label>
              <p class="setting-desc">Use GPU for rendering (requires restart)</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" checked />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Chart Animation Duration</label>
              <p class="setting-desc">Time for chart animations (0-2000ms)</p>
            </div>
            <div class="setting-control">
              <input type="range" min="0" max="2000" value="1000" class="slider" />
              <span class="slider-value">1000ms</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Analysis Settings Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>DATA ANALYSIS</h2>
        </div>
        <div class="card-body">
          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Auto Refresh Data</label>
              <p class="setting-desc">Automatically reload data when history changes</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Include Hidden Commands</label>
              <p class="setting-desc">Analyze commands starting with space</p>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <label class="setting-label">Data Retention Period</label>
              <p class="setting-desc">How long to keep historical data</p>
            </div>
            <select class="select-control">
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="180">180 Days</option>
              <option value="365">1 Year</option>
              <option value="0" selected>Forever</option>
            </select>
          </div>
        </div>
      </div>

      <!-- About & Links Card -->
      <div class="settings-card">
        <div class="card-header">
          <div class="header-dot"></div>
          <h2>ABOUT & LINKS</h2>
        </div>
        <div class="card-body">
          <div class="link-grid">
            <a href="https://github.com/yourusername/termlytic" class="link-item" target="_blank">
              <div class="link-content">
                <h4>GitHub Repository</h4>
                <p>View source code and contribute</p>
              </div>
              <i class="fas fa-external-link-alt"></i>
            </a>

            <a href="https://docs.termlytic.com" class="link-item" target="_blank">
              <div class="link-content">
                <h4>Documentation</h4>
                <p>Learn how to use Termlytic</p>
              </div>
              <i class="fas fa-external-link-alt"></i>
            </a>

            <a href="https://github.com/yourusername/termlytic/issues" class="link-item" target="_blank">
              <div class="link-content">
                <h4>Report Issue</h4>
                <p>Found a bug? Let us know</p>
              </div>
              <i class="fas fa-external-link-alt"></i>
            </a>

            <a href="https://github.com/yourusername/termlytic/blob/main/LICENSE" class="link-item" target="_blank">
              <div class="link-content">
                <h4>License</h4>
                <p>MIT License - Free to use</p>
              </div>
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Server Dialog -->
    <ServerDialog
      :visible="serverDialogVisible"
      :server="editingServer"
      @close="serverDialogVisible = false"
      @save="saveServer"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import RemoteServerCard from './settings/RemoteServerCard.vue'
import ServerDialog from './settings/ServerDialog.vue'

// Reactive data
const isClearing = ref(false)
const isRefreshing = ref(false)
const isDiagnosing = ref(false)
const message = ref(null)
const diagnosisResult = ref(null)
const cacheInfo = ref({
  status: 'Loading...',
  entries: 0,
  size: '0 KB',
  lastUpdate: 'Unknown'
})

// Remote Servers data
const remoteServers = ref([])
const serverDialogVisible = ref(false)
const editingServer = ref(null)

// Remote servers statistics
const remoteServersStats = computed(() => {
  return {
    total: remoteServers.value.length,
    enabled: remoteServers.value.filter((s) => s.enabled).length,
    synced: remoteServers.value.filter((s) => s.status === 'synced').length
  }
})

// Get cache information
const getCacheInfo = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-cache-info')
    if (result.success) {
      cacheInfo.value = {
        status: result.entries > 0 ? 'Has Data' : 'No Data',
        entries: result.entries.toLocaleString(),
        size: formatFileSize(result.size || 0),
        lastUpdate: result.lastUpdate
          ? new Date(result.lastUpdate).toLocaleDateString('en-US')
          : 'Unknown'
      }
    }
  } catch (err) {
    console.error('Failed to get cache info:', err)
    cacheInfo.value.status = 'Get Failed'
  }
}

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Clear cache
const clearCache = async () => {
  if (!confirm('Are you sure you want to clear all cache data? This operation cannot be undone.')) {
    return
  }

  isClearing.value = true
  message.value = null

  try {
    const result = await window.electron.ipcRenderer.invoke('clear-cache')
    if (result.success) {
      message.value = {
        type: 'success',
        text: 'Cache successfully cleared! Data will be re-analyzed on next startup.'
      }
      await getCacheInfo() // Refresh cache info
    } else {
      throw new Error(result.error || 'Failed to clear cache')
    }
  } catch (err) {
    console.error('Failed to clear cache:', err)
    message.value = {
      type: 'error',
      text: `Failed to clear cache: ${err.message}`
    }
  } finally {
    isClearing.value = false
  }
}

// Refresh cache info
const refreshCacheInfo = async () => {
  isRefreshing.value = true
  await getCacheInfo()
  isRefreshing.value = false
}

// Clear message
const clearMessage = () => {
  message.value = null
}

// Run shell history diagnosis
const runDiagnosis = async () => {
  isDiagnosing.value = true
  diagnosisResult.value = null
  message.value = null

  try {
    const result = await window.electron.ipcRenderer.invoke('diagnose-shell-history')
    if (result.success) {
      diagnosisResult.value = result.data
      message.value = {
        type: 'success',
        text: `Diagnosis completed! Processing time: ${result.processingTimeMs}ms`
      }
    } else {
      throw new Error(result.error || 'Diagnosis failed')
    }
  } catch (err) {
    console.error('Failed to run diagnosis:', err)
    message.value = {
      type: 'error',
      text: `Diagnosis failed: ${err.message}`
    }
  } finally {
    isDiagnosing.value = false
  }
}

// ========== Remote Servers Functions ==========

// Load remote servers
const loadRemoteServers = async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('get-remote-servers')
    if (result.success) {
      remoteServers.value = result.servers
    }
  } catch (error) {
    console.error('Failed to load remote servers:', error)
    showMessage('error', 'Failed to load remote servers')
  }
}

// Show add server dialog
const showAddServerDialog = () => {
  editingServer.value = null
  serverDialogVisible.value = true
}

// Edit server
const editServer = (server) => {
  editingServer.value = server
  serverDialogVisible.value = true
}

// Save server (add or update)
const saveServer = async (serverData) => {
  try {
    let result
    if (serverData.id) {
      // Update existing server
      result = await window.electron.ipcRenderer.invoke(
        'update-remote-server',
        serverData.id,
        serverData
      )
    } else {
      // Add new server
      result = await window.electron.ipcRenderer.invoke('add-remote-server', serverData)
    }

    if (result.success) {
      await loadRemoteServers()
      showMessage('success', serverData.id ? 'Server updated' : 'Server added successfully')
    } else {
      showMessage('error', result.error || 'Failed to save server')
    }
  } catch (error) {
    console.error('Failed to save server:', error)
    showMessage('error', 'Failed to save server')
  }
}

// Delete server
const deleteServer = async (serverId) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('delete-remote-server', serverId)
    if (result.success) {
      await loadRemoteServers()
      showMessage('success', 'Server deleted successfully')
    } else {
      showMessage('error', result.error || 'Failed to delete server')
    }
  } catch (error) {
    console.error('Failed to delete server:', error)
    showMessage('error', 'Failed to delete server')
  }
}

// Toggle server enabled status
const toggleServer = async (serverId, enabled) => {
  try {
    const result = await window.electron.ipcRenderer.invoke(
      'toggle-remote-server',
      serverId,
      enabled
    )
    if (result.success) {
      await loadRemoteServers()
      showMessage('success', enabled ? 'Server enabled' : 'Server disabled')
    } else {
      showMessage('error', result.error || 'Failed to toggle server')
    }
  } catch (error) {
    console.error('Failed to toggle server:', error)
    showMessage('error', 'Failed to toggle server')
  }
}

// Test connection
const testConnection = async (serverId) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('test-remote-connection', serverId)
    if (result.success && result.connected) {
      showMessage('success', `Connection successful! Latency: ${result.latency}ms`)
    } else {
      showMessage('error', result.error || 'Connection failed')
    }
  } catch (error) {
    console.error('Failed to test connection:', error)
    showMessage('error', 'Failed to test connection')
  }
}

// Sync server
const syncServer = async (serverId, progressCallback) => {
  try {
    const result = await window.electron.ipcRenderer.invoke('sync-remote-server', serverId)
    if (result.success) {
      await loadRemoteServers()
      showMessage('success', `Synced ${result.commandCount} commands in ${result.duration}ms`)
    } else {
      showMessage('error', result.error || 'Sync failed')
    }
  } catch (error) {
    console.error('Failed to sync server:', error)
    showMessage('error', 'Failed to sync server')
  }
}

// Get cache information when page loads
onMounted(() => {
  getCacheInfo()
  loadRemoteServers()
})

// Automatically clear message after timeout
const showMessage = (type, text) => {
  message.value = { type, text }
  setTimeout(() => {
    message.value = null
  }, 5000)
}
</script>


<style scoped>
/* Settings Wrapper */
.settings-wrapper {
  height: 100vh;
  overflow-y: auto;
  padding: 1rem;
  background-color: var(--bgPrimary);
}

/* Settings Content */
.settings-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 0.75rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Settings Card */
.settings-card {
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderPrimary);
  border-radius: 0.5rem;
  padding: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.settings-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--borderSecondary);
}

.header-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: var(--textSecondary);
  flex-shrink: 0;
}

.card-header h2 {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--textTertiary);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Card Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.description {
  color: var(--textSecondary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0 0 1rem;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--bgTertiary);
  border-radius: 0.5rem;
}

.info-label {
  font-size: 0.75rem;
  color: var(--textTertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--textPrimary);
  font-family: monospace;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background-color: var(--bgTertiary);
  border-radius: 0.5rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--textTertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--textPrimary);
}

/* Action Row */
.action-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn i {
  font-size: 0.875rem;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: var(--bgTertiary);
  color: var(--textPrimary);
  border: 1px solid var(--borderPrimary);
}

.btn-secondary {
  background-color: var(--bgTertiary);
  color: var(--textPrimary);
  border: 1px solid var(--borderPrimary);
}

.btn-danger {
  background-color: var(--bgTertiary);
  color: var(--textPrimary);
  border: 1px solid var(--borderPrimary);
}

.btn-danger:hover:not(:disabled) {
  border-color: var(--textSecondary);
}

/* Warning Notice */
.warning-notice {
  display: flex;
  align-items: start;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: var(--bgTertiary);
  border: 1px solid var(--borderSecondary);
  border-radius: 0.375rem;
}

.warning-notice i {
  color: var(--textSecondary);
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.warning-notice p {
  color: var(--textSecondary);
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.5;
}

/* Message Toast */
.message-toast {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--bgSecondary);
  border: 1px solid var(--borderPrimary);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
  min-width: 280px;
  max-width: 400px;
}

@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-success,
.toast-error {
  color: var(--textPrimary);
}

.toast-close {
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

/* Diagnosis Results */
.diagnosis-results {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-section {
  background-color: var(--bgTertiary);
  border: 1px solid var(--borderSecondary);
  border-radius: 0.5rem;
  padding: 0.75rem;
}

.result-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--textTertiary);
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Info Grid Small */
.info-grid-small {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--bgSecondary);
  border-radius: 0.375rem;
  gap: 1rem;
}

.info-label {
  color: var(--textTertiary);
  font-size: 0.8125rem;
}

.info-value {
  color: var(--textPrimary);
  font-family: monospace;
  font-size: 0.8125rem;
  font-weight: 500;
  text-align: right;
}

/* File List */
.file-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--bgSecondary);
  border-radius: 0.375rem;
  gap: 1rem;
}

.file-path {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.path-text {
  color: var(--textPrimary);
  font-family: monospace;
  font-size: 0.8125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.path-source {
  color: var(--textTertiary);
  font-size: 0.75rem;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--textSecondary);
  white-space: nowrap;
}

.file-status i {
  font-size: 0.875rem;
}

/* Recommendation List */
.recommendation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.recommendation-list li {
  padding: 0.5rem 0.75rem;
  background-color: var(--bgSecondary);
  border-radius: 0.375rem;
  color: var(--textSecondary);
  font-size: 0.8125rem;
  line-height: 1.5;
  border-left: 2px solid var(--borderPrimary);
}

/* Setting Item */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: var(--bgTertiary);
  border-radius: 0.5rem;
  gap: 1rem;
}

.setting-info {
  flex: 1;
}

.setting-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--textPrimary);
  margin-bottom: 0.25rem;
}

.setting-desc {
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bgPrimary);
  border: 2px solid var(--borderPrimary);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: var(--textTertiary);
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: var(--textSecondary);
  border-color: var(--textSecondary);
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(20px);
  background-color: var(--bgPrimary);
}

/* Setting Control */
.setting-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.slider {
  width: 160px;
  height: 4px;
  border-radius: 2px;
  background: var(--bgPrimary);
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--textSecondary);
  cursor: pointer;
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--textSecondary);
  cursor: pointer;
  border: none;
}

.slider-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--textPrimary);
  min-width: 60px;
  text-align: right;
}

.select-control {
  padding: 0.5rem 0.75rem;
  background-color: var(--bgPrimary);
  border: 1px solid var(--borderPrimary);
  border-radius: 0.375rem;
  color: var(--textPrimary);
  font-size: 0.875rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;
}

.select-control:hover {
  border-color: var(--textSecondary);
}

.select-control:focus {
  border-color: var(--textSecondary);
}

/* Link Grid */
.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--bgTertiary);
  border: 1px solid var(--borderSecondary);
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.link-item:hover {
  transform: translateY(-1px);
  border-color: var(--borderPrimary);
}

.link-content {
  flex: 1;
  min-width: 0;
}

.link-content h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0 0 0.25rem;
}

.link-content p {
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin: 0;
}

.link-item > .fa-external-link-alt {
  color: var(--textTertiary);
  font-size: 0.75rem;
  opacity: 0.5;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.link-item:hover > .fa-external-link-alt {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-wrapper {
    padding: 0.75rem;
  }

  .settings-content {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .action-row {
    flex-direction: column;
  }

  .action-row .btn {
    width: 100%;
  }

  .message-toast {
    left: 0.75rem;
    right: 0.75rem;
    min-width: auto;
  }

  .link-grid {
    grid-template-columns: 1fr;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .setting-control {
    width: 100%;
  }

  .slider {
    width: 100%;
  }
}

/* Remote Servers Styles */
.remote-servers-card .card-body {
  padding: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0 0 1.5rem;
}

.servers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.servers-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.servers-stats span {
  padding: 0.25rem 0.75rem;
  background: var(--bg-primary);
  border-radius: 4px;
}

.servers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .servers-grid {
    grid-template-columns: 1fr;
  }

  .servers-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .servers-stats {
    justify-content: space-between;
  }
}
</style>
