<template>
  <div class="card h-full flex-col">
    <!-- Title - fixed, no scroll -->
    <h4
      class="text-md font-medium mb-4 flex items-center shrink-0"
      :style="{ color: 'var(--textPrimary)' }"
    >
      <div
        class="w-2 h-2 rounded-full mr-2"
        :style="{ backgroundColor: 'var(--textSecondary)' }"
      ></div>
      Command Execution History
      <span v-if="selectedDate" class="ml-2 text-sm" :style="{ color: 'var(--textTertiary)' }">
        {{ selectedDate.formattedDate }}
      </span>
    </h4>

    <!-- No data state -->
    <div
      v-if="!selectedDate || !selectedDate.commands || selectedDate.commands.length === 0"
      class="flex-1 flex flex-col items-center justify-center"
      :style="{ color: 'var(--textTertiary)' }"
    >
      <svg class="w-12 h-12 mb-2 opacity-50" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
          clip-rule="evenodd"
        />
      </svg>
      <div>{{ !selectedDate ? 'Click on heatmap to select a date' : 'No command records' }}</div>
    </div>

    <!-- Command List - Scrollable Content -->
    <div v-else class="flex-1 min-h-0 flex flex-col">
      <!-- Statistics Information - Fixed, No Scroll -->
      <div
        class="rounded-lg p-4 mb-3 shrink-0"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderSecondary)'
        }"
      >
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div class="text-center">
            <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">
              {{ selectedDate.totalCommands }}
            </div>
            <div class="text-xs" :style="{ color: 'var(--textTertiary)' }">Total Commands</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">
              {{ uniqueCommands }}
            </div>
            <div class="text-xs" :style="{ color: 'var(--textTertiary)' }">Unique Commands</div>
          </div>
        </div>
      </div>

      <!-- Command Item List - Only This Section Scrolls -->
      <div class="flex-1 min-h-0 overflow-y-auto">
        <div class="space-y-1">
          <div
            v-for="(cmd, index) in displayCommands"
            :key="index"
            class="flex items-center justify-between p-3 bg-tertiary rounded hover:bg-hover transition-colors"
          >
            <div class="flex-1 min-w-0 mr-3">
              <div class="flex items-center mb-1">
                <code class="success-text font-mono text-sm break-all mr-2">{{ cmd.command }}</code>
                <span
                  v-if="cmd.count > 1"
                  class="accent-text bg-secondary text-xs px-2 py-0.5 rounded-full border border-divider"
                >
                  {{ cmd.count }}x
                </span>
              </div>
              <div class="text-secondary text-xs flex items-center space-x-3">
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ cmd.time }}
                </span>
                <span class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {{ cmd.shell }}
                </span>
              </div>
            </div>

            <!-- Command Type Indicator -->
            <div class="text-right">
              <span
                class="inline-block w-2 h-2 rounded-full"
                :class="getCommandTypeColor(cmd.command)"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  selectedDate: {
    type: Object,
    default: null
  }
})

// Computed properties
const uniqueCommands = computed(() => {
  if (!props.selectedDate?.commands) return 0
  const commands = new Set(props.selectedDate.commands.map((cmd) => cmd.command.split(' ')[0]))
  return commands.size
})

const displayCommands = computed(() => {
  if (!props.selectedDate?.commands) return []

  // Group commands and count occurrences
  const commandMap = new Map()
  props.selectedDate.commands.forEach((cmd) => {
    const key = cmd.command
    if (commandMap.has(key)) {
      commandMap.get(key).count++
      commandMap.get(key).times.push(cmd.time)
    } else {
      commandMap.set(key, {
        command: cmd.command,
        shell: cmd.shell,
        count: 1,
        times: [cmd.time],
        time: cmd.time // Show latest time
      })
    }
  })

  return Array.from(commandMap.values()).sort((a, b) => b.count - a.count) // Sort by usage frequency
})

// Methods
const getCommandTypeColor = (command) => {
  const mainCommand = command.split(' ')[0].toLowerCase()

  // Return different colors based on command type
  const commandTypes = {
    // File operations
    ls: 'bg-blue-500',
    cd: 'bg-blue-500',
    mkdir: 'bg-blue-500',
    rm: 'bg-red-500',
    cp: 'bg-blue-500',
    mv: 'bg-blue-500',

    // Git commands
    git: 'bg-green-500',

    // Development tools
    npm: 'bg-yellow-500',
    yarn: 'bg-yellow-500',
    node: 'bg-green-600',
    code: 'bg-purple-500',
    vim: 'bg-green-600',
    nano: 'bg-green-600',

    // System commands
    ps: 'bg-gray-500',
    top: 'bg-gray-500',
    kill: 'bg-red-500',
    sudo: 'bg-red-600',

    // Network
    curl: 'bg-orange-500',
    wget: 'bg-orange-500',
    ping: 'bg-orange-500',

    // Default
    default: 'bg-gray-400'
  }

  return commandTypes[mainCommand] || commandTypes.default
}
</script>

<style scoped>
/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #374151;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #6b7280;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
