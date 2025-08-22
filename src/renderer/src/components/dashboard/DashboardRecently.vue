<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col min-h-0 overflow-hidden"
  >
    <!-- Title bar -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
        <h3 class="text-sm font-medium text-white uppercase tracking-wider">RECENT COMMANDS</h3>
      </div>
      <div class="flex items-center space-x-2">
        <select
          v-model="selectedShell"
          @change="loadRecentCommands"
          class="bg-gray-800 text-white px-2 py-1 rounded text-xs border border-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="all">All Shells</option>
          <option value="bash">Bash Only</option>
          <option value="zsh">Zsh Only</option>
        </select>
        <button
          @click="loadRecentCommands"
          :disabled="loading"
          class="text-gray-400 hover:text-white px-2 py-1 rounded text-xs transition-colors"
          title="Refresh"
        >
          <i :class="['fas fa-sync-alt', { 'animate-spin': loading }]"></i>
        </button>
      </div>
    </div>

    <!-- Command list container -->
    <div class="flex-1 overflow-hidden flex flex-col min-h-0">
      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center h-32">
        <div class="text-gray-400 text-sm">Loading recent commands...</div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded border border-red-800 flex-shrink-0"
      >
        {{ error }}
        <button
          @click="loadRecentCommands"
          class="ml-2 text-blue-400 hover:text-blue-300 underline"
        >
          Retry
        </button>
      </div>

      <!-- No data state -->
      <div v-else-if="recentCommands.length === 0" class="flex items-center justify-center h-32">
        <div class="text-gray-400 text-sm">No recent commands found</div>
      </div>

      <!-- Command list - scrollable area -->
      <div v-else class="flex-1 overflow-y-auto scroll-smooth pr-2 space-y-2">
        <div
          v-for="(command, index) in recentCommands"
          :key="index"
          class="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 hover:border-gray-600 transition-all cursor-pointer group"
          @click="copyCommand(command.command)"
        >
          <div class="flex items-start justify-between">
            <!-- Command information -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-2">
                <code class="text-blue-300 font-mono text-sm break-all flex-1">{{
                  command.command
                }}</code>
                <span
                  :class="[
                    'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
                    getShellStyle(command.shell)
                  ]"
                >
                  {{ command.shell }}
                </span>
              </div>
              <div class="text-gray-400 text-xs flex items-center space-x-2">
                <i class="fas fa-clock text-gray-500"></i>
                <span>{{ formatTimestamp(command.timestamp) }}</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div
              class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0"
            >
              <button
                @click.stop="copyCommand(command.command)"
                class="text-gray-400 hover:text-blue-400 p-1.5 rounded border border-gray-700 hover:border-blue-500 transition-colors"
                title="Copy Command"
              >
                <i class="fas fa-copy text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom statistics information -->
    <div
      v-if="!loading && !error && recentCommands.length > 0"
      class="mt-4 pt-3 border-t border-gray-700 flex-shrink-0"
    >
      <div class="flex justify-between text-xs">
        <span class="text-gray-400">
          Showing {{ recentCommands.length }} commands
          <span v-if="selectedShell !== 'all'"> ({{ selectedShell }})</span>
        </span>
        <span class="text-gray-500">Click to copy</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// Use global data storage
const { getRecentCommands, isLoading } = useShellData()

// Reactive data
const recentCommands = ref([])
const error = ref('')
const selectedShell = ref('all')

// Load recently used commands
const loadRecentCommands = async () => {
  try {
    error.value = ''
    const result = await getRecentCommands(20)
    
    // Filter by terminal type
    let filteredCommands = result
    if (selectedShell.value !== 'all') {
      filteredCommands = result.filter((entry) => entry.shell === selectedShell.value)
    }
    
    recentCommands.value = filteredCommands

    console.log(`Loaded ${recentCommands.value.length} recent commands`)
  } catch (err) {
    console.error('Failed to load recent commands:', err)
    error.value = `LoadFailed: ${err.message}`
  }
}

// Format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown time'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) {
    return 'Just now'
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

// Get Shell style
const getShellStyle = (shell) => {
  switch (shell?.toLowerCase()) {
    case 'bash':
      return 'bg-emerald-900 text-emerald-300 border border-emerald-700'
    case 'zsh':
      return 'bg-blue-900 text-blue-300 border border-blue-700'
    case 'fish':
      return 'bg-amber-900 text-amber-300 border border-amber-700'
    case 'powershell':
    case 'pwsh':
      return 'bg-violet-900 text-violet-300 border border-violet-700'
    default:
      return 'bg-gray-700 text-gray-300 border border-gray-600'
  }
}

// Copy command to clipboard
const copyCommand = async (command) => {
  try {
    await navigator.clipboard.writeText(command)
    console.log('Command copied to clipboard:', command)

    // Here you can add a simple hint, such as temporarily changing the button color
    // Since there is no toast component in the UI framework, we display it in the console first
  } catch (err) {
    console.error('Failed to copy command:', err)
  }
}

// Load data when component is mounted
onMounted(() => {
  console.log('Recently used commands component mounted')
  loadRecentCommands()
})
</script>

<style scoped>
/* Scrollbar styles */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

/* Animation effects */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 自定义Scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.8) rgba(55, 65, 81, 0.3);
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(55, 65, 81, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(107, 114, 128, 0.8);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.9);
}

/* Smooth scrolling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Code font */
code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
</style>
