<template>
  <div
    class="w-full h-full rounded-lg p-4 flex flex-col min-h-0 overflow-hidden"
    :style="{
      backgroundColor: 'var(--bgSecondary)',
      border: '1px solid var(--borderPrimary)'
    }"
  >
    <!-- Title bar -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3
          class="text-sm font-medium uppercase tracking-wider"
          :style="{ color: 'var(--textPrimary)' }"
        >
          RECENT COMMANDS
        </h3>
      </div>
      <div class="flex items-center space-x-2">
        <select
          v-model="selectedShell"
          @change="loadRecentCommands"
          class="px-2 py-1 rounded text-xs focus:outline-none"
          :style="{
            backgroundColor: 'var(--bgTertiary)',
            color: 'var(--textPrimary)',
            border: '1px solid var(--borderSecondary)'
          }"
        >
          <option value="all">All Shells</option>
          <option value="bash">Bash Only</option>
          <option value="zsh">Zsh Only</option>
        </select>
        <button
          @click="loadRecentCommands"
          :disabled="loading"
          class="px-2 py-1 rounded text-xs transition-colors hover-button"
          :style="{ color: 'var(--textSecondary)' }"
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
        <div class="text-sm" :style="{ color: 'var(--textSecondary)' }">
          Loading recent commands...
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else-if="error"
        class="text-sm p-3 rounded flex-shrink-0"
        :style="{
          color: 'var(--error)',
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--error)'
        }"
      >
        {{ error }}
        <button
          @click="loadRecentCommands"
          class="ml-2 underline hover-text"
          :style="{ color: 'var(--textPrimary)' }"
        >
          Retry
        </button>
      </div>

      <!-- No data state -->
      <div v-else-if="recentCommands.length === 0" class="flex items-center justify-center h-32">
        <div class="text-sm" :style="{ color: 'var(--textSecondary)' }">
          No recent commands found
        </div>
      </div>

      <!-- Command list - scrollable area -->
      <div v-else class="flex-1 overflow-y-auto scroll-smooth pr-2 space-y-2">
        <div
          v-for="(command, index) in recentCommands"
          :key="index"
          class="rounded-lg p-3 transition-all cursor-pointer group hover-item"
          :style="{
            backgroundColor: 'var(--bgTertiary)',
            border: '1px solid var(--borderSecondary)'
          }"
          @click="copyCommand(command.command)"
        >
          <div class="flex items-start justify-between">
            <!-- Command information -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center space-x-2 mb-2">
                <code
                  class="font-mono text-sm break-all flex-1"
                  :style="{ color: 'var(--textPrimary)' }"
                  >{{ command.command }}</code
                >
                <span
                  class="px-2 py-1 rounded text-xs font-medium flex-shrink-0"
                  :style="getShellColor(command.shell)"
                >
                  {{ command.shell }}
                </span>
              </div>
              <div
                class="text-xs flex items-center space-x-2"
                :style="{ color: 'var(--textTertiary)' }"
              >
                <i class="fas fa-clock"></i>
                <span>{{ formatTimestamp(command.timestamp) }}</span>
              </div>
            </div>

            <!-- Action buttons -->
            <div
              class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0"
            >
              <button
                @click.stop="copyCommand(command.command)"
                class="p-1.5 rounded transition-colors hover-copy-button"
                :style="{
                  color: 'var(--textSecondary)',
                  border: '1px solid var(--borderSecondary)'
                }"
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
      class="mt-4 pt-3 flex-shrink-0"
      :style="{ borderTop: '1px solid var(--borderSecondary)' }"
    >
      <div class="flex justify-between text-xs">
        <span :style="{ color: 'var(--textTertiary)' }">
          Showing {{ recentCommands.length }} commands
          <span v-if="selectedShell !== 'all'"> ({{ selectedShell }})</span>
        </span>
        <span :style="{ color: 'var(--textMuted)' }">Click to copy</span>
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
  // Use inline styles instead of Tailwind classes
  return ''
}

// Get shell color based on type (for inline styling)
const getShellColor = (shell) => {
  switch (shell?.toLowerCase()) {
    case 'bash':
      return {
        backgroundColor: 'var(--bgTertiary)',
        color: 'var(--success)',
        border: '1px solid var(--success)'
      }
    case 'zsh':
      return {
        backgroundColor: 'var(--bgTertiary)',
        color: 'var(--textPrimary)',
        border: '1px solid var(--textPrimary)'
      }
    case 'fish':
      return {
        backgroundColor: 'var(--bgTertiary)',
        color: 'var(--warning)',
        border: '1px solid var(--warning)'
      }
    case 'powershell':
    case 'pwsh':
      return {
        backgroundColor: 'var(--bgTertiary)',
        color: 'var(--textSecondary)',
        border: '1px solid var(--textSecondary)'
      }
    default:
      return {
        backgroundColor: 'var(--bgTertiary)',
        color: 'var(--textSecondary)',
        border: '1px solid var(--borderSecondary)'
      }
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
/* Hover effects */
.hover-button:hover {
  background-color: var(--bgHover);
  color: var(--textPrimary);
}

.hover-item:hover {
  background-color: var(--bgHover);
  border-color: var(--borderSecondary);
}

.hover-copy-button:hover {
  color: var(--textPrimary);
  border-color: var(--textPrimary);
}

.hover-text:hover {
  opacity: 0.8;
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

/* Smooth scrolling */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* Code font */
code {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
</style>
