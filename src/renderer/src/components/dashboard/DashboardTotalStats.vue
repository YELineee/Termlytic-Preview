<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg p-4 flex flex-col justify-between border border-gray-800"
  >
    <!-- Title -->
    <div class="flex items-center justify-between">
      <div class="text-xs text-gray-400 uppercase tracking-wider font-medium">COMPLETED TASKS</div>
      <div class="text-xs text-gray-500">∞</div>
    </div>

    <!-- Main Values -->
    <div class="flex-1 flex flex-col justify-center">
      <div class="text-4xl font-bold text-white mb-1">
        {{ isLoading ? '...' : formatMainNumber(stats.totalCommands) }}
      </div>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-400">/</span>
        <span class="text-xs text-purple-400 uppercase tracking-wider">{{
          getMainUnit(stats.totalCommands)
        }}</span>
      </div>
    </div>

    <!-- 次要指标 -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500">Active Days</span>
        <span class="text-gray-300">{{ stats.activeDays }}</span>
      </div>
      <div class="flex items-center justify-between text-xs">
        <span class="text-gray-500">Unique Cmds</span>
        <span class="text-gray-300">{{ formatNumber(stats.uniqueCommands) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// 使用全局Data存储
const { getStats, isLoading } = useShellData()

// Reactive data
const stats = ref({
  totalCommands: 0,
  activeDays: 0,
  uniqueCommands: 0
})

// Methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// 格式化主要数字（更突出的显示）
const formatMainNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1)
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
}

// Get主要单位
const getMainUnit = (num) => {
  if (num >= 1000000) {
    return 'M'
  } else if (num >= 1000) {
    return 'K'
  }
  return ''
}

const loadStats = async () => {
  try {
    const result = await getStats()
    stats.value = result
  } catch (err) {
    console.error('Failed to load stats:', err)
  }
}

// 组件挂载时LoadData
onMounted(() => {
  loadStats()
})
</script>
