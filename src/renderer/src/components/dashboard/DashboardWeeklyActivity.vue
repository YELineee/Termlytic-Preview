<template>
  <div
    class="w-full h-full bg-gray-900 rounded-lg border border-gray-800 p-4 flex flex-col min-h-0"
  >
    <!-- Title -->
    <div class="flex items-center justify-between mb-4 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
        <h3 class="text-sm font-medium text-white uppercase tracking-wider">WEEKLY ACTIVITY</h3>
      </div>
      <div class="text-xs text-gray-400">Last 7 days</div>
    </div>

    <!-- Activity热度图 -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4 flex-shrink-0">
      <div class="text-xs text-gray-400 mb-3">Activity Heatmap</div>
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in weekStats"
          :key="day.name"
          @click="selectDay(index)"
          class="aspect-square rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer"
          :style="{
            backgroundColor:
              getDayColor(index) +
              (day.intensityPercentage > 0 ? Math.max(20, selectedDayIndex === index ? 90 : day.intensityPercentage).toString(16).slice(0, 2) : '10'),
            color: selectedDayIndex === index || day.intensityPercentage > 50 ? '#FFFFFF' : getDayColor(index),
            border: '1px solid ' + getDayColor(index) + (selectedDayIndex === index ? 'FF' : '40'),
            transform: selectedDayIndex === index ? 'scale(1.05)' : 'scale(1)'
          }"
        >
          {{ day.short }}
        </div>
      </div>
    </div>

    <!-- Selected date details -->
    <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-4 flex-shrink-0">
      <div class="text-xs text-gray-400 mb-2">Selected Day Details</div>
      <div v-if="selectedDay" class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <div
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: getDayColor(selectedDayIndex) }"
          ></div>
          <span class="text-sm font-medium text-white">{{ selectedDay.name }}</span>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold text-white">{{ selectedDay.count }}</div>
          <div class="text-xs text-gray-400">{{ selectedDay.weekPercentage.toFixed(1) }}% of week</div>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 text-center py-2">
        Click on a day above to view details
      </div>
    </div>

    <!-- Statistics信息 -->
    <div class="mt-auto pt-3 border-t border-gray-700 flex-shrink-0">
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="flex justify-between">
          <span class="text-gray-400">Most Active</span>
          <span class="text-purple-400 font-medium">{{ mostActiveDay }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Total</span>
          <span class="text-gray-300 font-medium">{{ weekData.reduce((a, b) => a + b, 0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

// 使用全局Data存储
const { getWeeklyActivity, isLoading } = useShellData()

const weekData = ref(Array(7).fill(0))
const selectedDayIndex = ref(0) // 默认选择第一天

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const dayShorts = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Computed properties
const maxCount = computed(() => Math.max(...weekData.value))

const weekStats = computed(() => {
  const totalWeekCommands = weekData.value.reduce((sum, count) => sum + count, 0) || 1
  const maxCount = Math.max(...weekData.value) || 1
  
  return dayNames.map((name, index) => ({
    name,
    short: dayShorts[index],
    count: weekData.value[index],
    // 相对于最高活跃天的百分比（用于颜色强度）
    intensityPercentage: (weekData.value[index] / maxCount) * 100,
    // Percentage in the whole week (for display)
    weekPercentage: (weekData.value[index] / totalWeekCommands) * 100
  }))
})

// Current selected date details
const selectedDay = computed(() => {
  if (selectedDayIndex.value >= 0 && selectedDayIndex.value < weekStats.value.length) {
    return weekStats.value[selectedDayIndex.value]
  }
  return null
})

const mostActiveDay = computed(() => {
  const maxIndex = weekData.value.indexOf(maxCount.value)
  return dayNames[maxIndex]
})

// 选择日期函数
const selectDay = (index) => {
  selectedDayIndex.value = index
}

// Get星期颜色
const getDayColor = (index) => {
  const colors = [
    '#ef4444', // Sunday - red-500
    '#3b82f6', // Monday - blue-500
    '#10b981', // Tuesday - emerald-500
    '#f59e0b', // Wednesday - amber-500
    '#8b5cf6', // Thursday - violet-500
    '#ec4899', // Friday - pink-500
    '#6366f1' // Saturday - indigo-500
  ]
  return colors[index]
}

// Load星期DistributionData
const loadWeekStats = async () => {
  try {
    const weekCounts = await getWeeklyActivity()
    weekData.value = weekCounts
  } catch (err) {
    console.error('Failed to load week stats:', err)
  }
}

onMounted(() => {
  loadWeekStats()
})
</script>

<style scoped>
/* 保持简洁 */
</style>
