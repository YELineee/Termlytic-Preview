<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col justify-between border border-gray-800"
  >
    <!-- Title and Metrics -->
    <div class="flex items-center justify-between">
      <div class="text-xs text-gray-400 uppercase tracking-wider font-medium">TODAY'S FOCUS</div>
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
    </div>

    <!-- Main Values -->
    <div class="flex-1 flex flex-col justify-center">
      <div class="text-3xl font-bold text-white mb-1">
        {{ isLoading ? '...' : formatNumber(todayCommands) }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-400">/</span>
        <span class="text-xs text-blue-400 uppercase tracking-wider">CMD</span>
      </div>
    </div>

    <!-- Bottom Information -->
    <div class="flex items-center justify-between text-xs">
      <span class="text-gray-500">{{ formatDate(today) }}</span>
      <div class="flex items-center space-x-1">
        <div class="w-1 h-1 bg-green-400 rounded-full"></div>
        <span class="text-green-400">LIVE</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// Use global data store
const { getShellHistory, isLoading } = useShellData()

// Reactive data
const todayCommands = ref(0)
const today = new Date()

// Format date
const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// Format numbers
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Get today's command data
const loadTodayStats = async () => {
  try {
    const result = await getShellHistory()

    if (result.success && result.entries) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      // Filter today's commands
      const todayEntries = result.entries.filter((entry) => {
        if (!entry.timestamp) return false

        const entryDate = new Date(entry.timestamp)
        return entryDate >= todayStart && entryDate <= todayEnd
      })

      todayCommands.value = todayEntries.length
    }
  } catch (err) {
    console.error('Failed to load today stats:', err)
    todayCommands.value = 0
  }
}

// Load data when component mounts
onMounted(() => {
  loadTodayStats()
})
</script>

<style scoped>
/* Ensure font clarity */
.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
</style>
