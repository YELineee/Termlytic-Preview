<template>
  <div
    class="w-full h-full rounded-lg p-4 flex flex-col min-h-0 dashboard-card"
    :style="{
      backgroundColor: 'var(--bgSecondary)',
      border: '1px solid var(--borderPrimary)'
    }"
  >
    <!-- Title -->
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
          WEEKLY ACTIVITY
        </h3>
      </div>
      <div class="text-xs" :style="{ color: 'var(--textTertiary)' }">Last 7 days</div>
    </div>

    <!-- Activity Heatmap -->
    <div
      class="rounded-lg p-3 mb-4 flex-shrink-0"
      :style="{
        backgroundColor: 'var(--bgTertiary)',
        border: '1px solid var(--borderSecondary)'
      }"
    >
      <div class="text-xs mb-3" :style="{ color: 'var(--textTertiary)' }">Activity Heatmap</div>
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(day, index) in weekStats"
          :key="day.name"
          @click="selectDay(index)"
          class="aspect-square rounded flex items-center justify-center text-xs font-medium transition-all hover:scale-105 cursor-pointer"
          :style="{
            backgroundColor:
              getDayColor(index) +
              (day.intensityPercentage > 0
                ? Math.max(20, selectedDayIndex === index ? 90 : day.intensityPercentage)
                    .toString(16)
                    .slice(0, 2)
                : '10'),
            color:
              selectedDayIndex === index || day.intensityPercentage > 50
                ? 'var(--textPrimary)'
                : getDayColor(index),
            border: '1px solid ' + getDayColor(index) + (selectedDayIndex === index ? 'FF' : '40'),
            transform: selectedDayIndex === index ? 'scale(1.05)' : 'scale(1)'
          }"
        >
          {{ day.short }}
        </div>
      </div>
    </div>

    <!-- Selected date details -->
    <div
      class="rounded-lg p-3 mb-4 flex-shrink-0 flex items-center"
      :style="{
        backgroundColor: 'var(--bgTertiary)',
        border: '1px solid var(--borderSecondary)',
        minHeight: '80px'
      }"
    >
      <div class="w-full">
        <div class="text-xs mb-2" :style="{ color: 'var(--textTertiary)' }">
          Selected Day Details
        </div>
        <div v-if="selectedDay" class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: getDayColor(selectedDayIndex) }"
            ></div>
            <span class="text-sm font-medium" :style="{ color: 'var(--textPrimary)' }">{{
              selectedDay.name
            }}</span>
          </div>
          <div class="text-right">
            <div class="text-lg font-bold" :style="{ color: 'var(--textPrimary)' }">
              {{ selectedDay.count }}
            </div>
            <div class="text-xs" :style="{ color: 'var(--textTertiary)' }">
              {{ selectedDay.weekPercentage.toFixed(1) }}% of week
            </div>
          </div>
        </div>
        <div v-else class="text-xs text-center py-2" :style="{ color: 'var(--textMuted)' }">
          Click on a day above to view details
        </div>
      </div>
    </div>

    <!-- Statistics Information -->
    <div
      class="mt-auto pt-3 flex-shrink-0"
      :style="{ borderTop: '1px solid var(--borderSecondary)' }"
    >
      <div class="grid grid-cols-2 gap-4 text-xs">
        <div class="flex justify-between">
          <span :style="{ color: 'var(--textTertiary)' }">Most Active</span>
          <span class="font-medium" :style="{ color: 'var(--textSecondary)' }">{{
            mostActiveDay
          }}</span>
        </div>
        <div class="flex justify-between">
          <span :style="{ color: 'var(--textTertiary)' }">Total</span>
          <span class="font-medium" :style="{ color: 'var(--textSecondary)' }">{{
            weekData.reduce((a, b) => a + b, 0)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'
import { useTheme } from '../../composables/useTheme'

// Use global data store
const { getWeeklyActivity, isLoading } = useShellData()
const { currentThemeMode } = useTheme()

const weekData = ref(Array(7).fill(0))
const selectedDayIndex = ref(0) // Default to select first day

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
    // Percentage relative to the most active day (for color intensity)
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

// Select date function
const selectDay = (index) => {
  selectedDayIndex.value = index
}

// Get day color - black & white theme
const getDayColor = (index) => {
  const isDark = currentThemeMode.value === 'dark'

  // Use grayscale gradient for different days
  const darkColors = [
    '#F3F4F6', // Sunday - gray-100
    '#E5E7EB', // Monday - gray-200
    '#D1D5DB', // Tuesday - gray-300
    '#9CA3AF', // Wednesday - gray-400
    '#6B7280', // Thursday - gray-500
    '#4B5563', // Friday - gray-600
    '#374151' // Saturday - gray-700
  ]

  const lightColors = [
    '#111827', // Sunday - gray-900
    '#1F2937', // Monday - gray-800
    '#374151', // Tuesday - gray-700
    '#4B5563', // Wednesday - gray-600
    '#6B7280', // Thursday - gray-500
    '#9CA3AF', // Friday - gray-400
    '#D1D5DB' // Saturday - gray-300
  ]

  return isDark ? darkColors[index] : lightColors[index]
}

// Load weekly distribution data
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
/* Keep it simple */
</style>
