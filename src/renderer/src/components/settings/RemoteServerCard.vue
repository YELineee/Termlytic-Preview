<template>
  <div class="remote-server-card" :class="{ disabled: !server.enabled }">
    <div class="server-header">
      <div class="server-info">
        <div class="server-name">
          {{ server.name }}
          <span v-if="server.isMock" class="mock-badge">MOCK</span>
        </div>
        <div class="server-host">{{ server.username }}@{{ server.host }}:{{ server.port }}</div>
      </div>
      <div class="server-actions">
        <button class="btn-icon" @click="toggleServer" :title="server.enabled ? 'Disable' : 'Enable'">
          <span v-if="server.enabled">✓</span>
          <span v-else>○</span>
        </button>
        <button class="btn-icon" @click="$emit('edit', server)" title="Edit">
          ✎
        </button>
        <button class="btn-icon" @click="deleteServer" title="Delete">
          ✕
        </button>
      </div>
    </div>

    <div class="server-stats">
      <div class="stat-item">
        <span class="stat-label">Status</span>
        <span class="stat-value" :class="statusClass">{{ statusText }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Commands</span>
        <span class="stat-value">{{ server.commandCount || 0 }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Last Sync</span>
        <span class="stat-value">{{ lastSyncText }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Shell Types</span>
        <span class="stat-value">{{ shellTypesText }}</span>
      </div>
    </div>

    <div class="server-footer">
      <button class="btn-test" @click="testConnection" :disabled="testing || syncing">
        {{ testing ? 'Testing...' : 'Test Connection' }}
      </button>
      <button
        class="btn-sync"
        @click="syncServer"
        :disabled="!server.enabled || testing || syncing"
      >
        {{ syncing ? syncProgress : 'Sync Data' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  server: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle', 'test', 'sync'])

const testing = ref(false)
const syncing = ref(false)
const syncProgress = ref('Sync Data')

const statusClass = computed(() => {
  const status = props.server.status
  if (status === 'synced') return 'status-success'
  if (status === 'syncing') return 'status-syncing'
  if (status === 'sync_failed' || status === 'error') return 'status-error'
  return 'status-default'
})

const statusText = computed(() => {
  const status = props.server.status
  const statusMap = {
    never_synced: 'Never Synced',
    synced: 'Synced',
    syncing: 'Syncing',
    sync_failed: 'Sync Failed',
    error: 'Error'
  }
  return statusMap[status] || 'Unknown'
})

const lastSyncText = computed(() => {
  if (!props.server.lastSync) return 'Never'
  const date = new Date(props.server.lastSync)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return 'Just now'
})

const shellTypesText = computed(() => {
  if (!props.server.shellTypes || props.server.shellTypes.length === 0) {
    return 'Unknown'
  }
  return props.server.shellTypes.join(', ')
})

async function toggleServer() {
  emit('toggle', props.server.id, !props.server.enabled)
}

async function deleteServer() {
  if (confirm(`Are you sure you want to delete server "${props.server.name}"? This will also delete all synced data.`)) {
    emit('delete', props.server.id)
  }
}

async function testConnection() {
  testing.value = true
  try {
    await emit('test', props.server.id)
  } finally {
    testing.value = false
  }
}

async function syncServer() {
  syncing.value = true
  syncProgress.value = 'Syncing...'

  try {
    await emit('sync', props.server.id, (progress) => {
      // Update sync progress text
      const stageText = {
        connecting: 'Connecting',
        discovering: 'Discovering',
        downloading: 'Downloading',
        parsing: 'Parsing',
        saving: 'Saving'
      }
      syncProgress.value = `${stageText[progress.stage] || 'Syncing'} ${progress.percent}%`
    })
  } finally {
    syncing.value = false
    syncProgress.value = 'Sync Data'
  }
}
</script>

<style scoped>
.remote-server-card {
  background: var(--bgSecondary);
  border: 1px solid var(--borderPrimary);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

.remote-server-card:hover {
  border-color: var(--borderSecondary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.remote-server-card.disabled {
  opacity: 0.6;
}

.server-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.server-info {
  flex: 1;
}

.server-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mock-badge {
  display: inline-block;
  padding: 2px 6px;
  font-size: 10px;
  font-weight: 700;
  color: #667eea;
  background: rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.server-host {
  font-size: 13px;
  color: var(--textSecondary);
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.server-actions {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  color: var(--textSecondary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bgHover);
  color: var(--textPrimary);
}

.server-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px;
  background: var(--bgPrimary);
  border-radius: 6px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: var(--textTertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 14px;
  color: var(--textPrimary);
  font-weight: 500;
}

.status-success {
  color: #10b981;
}

.status-syncing {
  color: #3b82f6;
}

.status-error {
  color: #ef4444;
}

.status-default {
  color: var(--textSecondary);
}

.server-footer {
  display: flex;
  gap: 8px;
}

.btn-test,
.btn-sync {
  flex: 1;
  padding: 7px 14px;
  border: 1px solid var(--borderPrimary);
  background: var(--bgPrimary);
  color: var(--textPrimary);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-test:hover,
.btn-sync:hover {
  border-color: var(--borderSecondary);
  background: var(--bgHover);
}

.btn-test:disabled,
.btn-sync:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sync {
  background: #667eea;
  color: white;
  border: none;
}

.btn-sync:hover:not(:disabled) {
  background: #5568d3;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}
</style>
