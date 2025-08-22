<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col justify-between border border-gray-800"
  >
    <!-- 标题和指标 -->
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

    <!-- 底部信息 -->
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

// 使用全局Data存储
const { getShellHistory, isLoading } = useShellData()

// Reactive data
const todayCommands = ref(0)
const today = new Date()

// 格式化日期
const formatDate = (date) => {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Get今日CommandData
const loadTodayStats = async () => {
  try {
    const result = await getShellHistory()

    if (result.success && result.entries) {
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      // 筛选今日的Command
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

// 组件挂载时LoadData
onMounted(() => {
  loadTodayStats()
})
</script>

<style scoped>
/* 确保字体清晰度 */
.font-mono {
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
</style>
