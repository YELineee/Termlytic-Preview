<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col min-h-0 overflow-hidden"
  >
    <!-- Title -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
        <h3 class="text-sm font-medium text-white uppercase tracking-wider">SHELL DISTRIBUTION</h3>
      </div>
      <div class="text-xs text-gray-400">{{ totalCommands }} commands</div>
    </div>

    <!-- Shell Type Statistics -->
    <div class="flex-1 space-y-3 min-h-0 overflow-y-auto">
      <div
        v-for="(shell, index) in shellStats"
        :key="shell.name"
        class="bg-gray-800 border border-gray-700 rounded-lg p-3 hover:bg-gray-750 transition-colors flex-shrink-0"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3 min-w-0 flex-1">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              :style="{
                backgroundColor: getShellColor(shell.name) + '20',
                border: '1px solid ' + getShellColor(shell.name) + '40'
              }"
            >
              <i
                :class="getShellIcon(shell.name)"
                :style="{ color: getShellColor(shell.name) }"
                class="text-sm"
              ></i>
            </div>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="text-white text-sm font-medium truncate">{{ shell.name }}</span>
              <span class="text-xs text-gray-400">{{ shell.count }} sessions</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="text-sm font-semibold text-white">{{ shell.percentage.toFixed(1) }}%</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-700 h-1.5 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500 ease-out rounded-full"
            :style="{
              width: `${shell.percentage}%`,
              backgroundColor: getShellColor(shell.name)
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Statistics Information -->
    <div class="mt-4 pt-3 border-t border-gray-700 flex-shrink-0">
      <div class="flex justify-between text-xs">
        <span class="text-gray-400">Total Sessions</span>
        <span class="text-gray-300 font-medium">{{ totalCommands }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// Use global data store
const { getShellDistribution, isLoading } = useShellData()

const shellData = ref({})

// Computed properties
const totalCommands = computed(() =>
  Object.values(shellData.value).reduce((sum, count) => sum + count, 0)
)

const shellStats = computed(() => {
  const total = totalCommands.value || 1
  return Object.entries(shellData.value)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100
    }))
    .sort((a, b) => b.count - a.count)
})

// Get terminal icon
const getShellIcon = (shellName) => {
  switch (shellName?.toLowerCase()) {
    case 'bash':
      return 'fas fa-terminal'
    case 'zsh':
      return 'fas fa-code'
    case 'fish':
      return 'fas fa-fish'
    case 'powershell':
    case 'pwsh':
      return 'fab fa-windows'
    case 'cmd':
      return 'fas fa-window-maximize'
    default:
      return 'fas fa-cogs'
  }
}

// Get terminal color
const getShellColor = (shellName) => {
  switch (shellName?.toLowerCase()) {
    case 'bash':
      return '#10b981' // emerald-500
    case 'zsh':
      return '#3b82f6' // blue-500
    case 'fish':
      return '#f59e0b' // amber-500
    case 'powershell':
    case 'pwsh':
      return '#8b5cf6' // violet-500
    case 'cmd':
      return '#ef4444' // red-500
    default:
      return '#6b7280' // gray-500
  }
}

// Load terminal distribution data
const loadShellStats = async () => {
  try {
    const result = await getShellDistribution()
    shellData.value = result || {}
  } catch (err) {
    console.error('Failed to load shell stats:', err)
    shellData.value = {}
  }
}

onMounted(() => {
  loadShellStats()
})
</script>

<style scoped>
/* Keep it simple */
</style>
