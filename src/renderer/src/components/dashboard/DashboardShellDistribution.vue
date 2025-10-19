<template>
  <div class="card min-h-0 overflow-hidden dashboard-card">
    <!-- Title -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3 class="text-sm font-medium uppercase tracking-wider text-primary">
          SHELL DISTRIBUTION
        </h3>
      </div>
      <div class="text-xs text-tertiary">{{ totalCommands }} commands</div>
    </div>

    <!-- Shell Type Statistics -->
    <div class="flex-1 space-y-3 min-h-0 overflow-y-auto">
      <div
        v-for="(shell, index) in shellStats"
        :key="shell.name"
        class="rounded-lg p-3 transition-colors flex-shrink-0 bg-tertiary border border-secondary hover-item"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3 min-w-0 flex-1">
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 shell-icon-bg"
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
              <span class="text-sm font-medium truncate text-primary">{{ shell.name }}</span>
              <span class="text-xs text-tertiary">{{ shell.count }} sessions</span>
            </div>
          </div>
          <div class="text-right flex-shrink-0">
            <div class="text-sm font-semibold text-primary">{{ shell.percentage.toFixed(1) }}%</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="h-1.5 rounded-full overflow-hidden bg-secondary">
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
    <div class="mt-4 pt-3 flex-shrink-0 border-t border-secondary">
      <div class="flex justify-between text-xs">
        <span class="text-tertiary">Total Sessions</span>
        <span class="font-medium text-secondary">{{ totalCommands }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'
import { useTheme } from '../../composables/useTheme'

// Use global data store
const { getShellDistribution, isLoading } = useShellData()
const { currentThemeMode } = useTheme()

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

// Get terminal color - supports colorful theme
const getShellColor = (shellName) => {
  const theme = currentThemeMode.value

  // Colorful theme - different colors for each shell
  if (theme === 'colorful') {
    const colorfulColors = {
      bash: '#00D9FF', // cyan
      zsh: '#7B68EE', // purple
      fish: '#FF6B9D', // pink
      powershell: '#4ECDC4', // turquoise
      pwsh: '#FFD93D', // golden
      cmd: '#6BCF7F', // mint green
      default: '#00A8CC' // default cyan
    }
    return colorfulColors[shellName?.toLowerCase()] || colorfulColors.default
  }

  // Dark theme - grayscale
  if (theme === 'dark') {
    const darkColors = {
      bash: '#F3F4F6', // gray-100
      zsh: '#D1D5DB', // gray-300
      fish: '#9CA3AF', // gray-400
      powershell: '#6B7280', // gray-500
      pwsh: '#6B7280', // gray-500
      cmd: '#4B5563', // gray-600
      default: '#9CA3AF' // gray-400
    }
    return darkColors[shellName?.toLowerCase()] || darkColors.default
  }

  // Light theme - grayscale
  const lightColors = {
    bash: '#111827', // gray-900
    zsh: '#374151', // gray-700
    fish: '#4B5563', // gray-600
    powershell: '#6B7280', // gray-500
    pwsh: '#6B7280', // gray-500
    cmd: '#9CA3AF', // gray-400
    default: '#6B7280' // gray-500
  }
  return lightColors[shellName?.toLowerCase()] || lightColors.default
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
/* Styles inherited from main.css */
</style>
