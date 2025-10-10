<template>
  <div
    class="w-full h-full rounded-lg p-4 flex flex-col justify-between"
    :style="{ 
      backgroundColor: 'var(--bgSecondary)', 
      border: '1px solid var(--borderPrimary)' 
    }"
  >
    <!-- Title and Metrics -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        <div class="text-xs uppercase tracking-wider font-medium" 
             :style="{ color: 'var(--textTertiary)' }">TODAY'S FOCUS</div>
      </div>
    </div>

    <!-- Main Values -->
    <div class="flex-1 flex flex-col justify-center">
      <div class="text-3xl font-bold mb-1" :style="{ color: 'var(--textPrimary)' }">
        {{ isLoading ? '...' : formatNumber(todayCommands) }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm" :style="{ color: 'var(--textSecondary)' }">/</span>
        <span class="text-xs uppercase tracking-wider" :style="{ color: 'var(--textSecondary)' }">CMD</span>
      </div>
    </div>

    <!-- Bottom Information -->
    <div class="flex items-center justify-between text-xs">
      <span :style="{ color: 'var(--textTertiary)' }">{{ formatDate(today) }}</span>
      <div class="flex items-center space-x-1">
        <div class="w-1 h-1 rounded-full" :style="{ backgroundColor: 'var(--textSecondary)' }"></div>
        <span :style="{ color: 'var(--textSecondary)' }">LIVE</span>
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
