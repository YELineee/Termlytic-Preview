<template>
  <div
    ref="containerRef"
    class="w-full h-full rounded-lg p-3 flex flex-col min-h-0 dashboard-card"
    :style="{
      backgroundColor: 'var(--bgSecondary)',
      border: '1px solid var(--borderPrimary)'
    }"
  >
    <!-- Title -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3
          class="text-xs uppercase tracking-wider font-medium"
          :style="{ color: 'var(--textTertiary)' }"
        >
          PAID INVOICES
        </h3>
      </div>
      <div class="text-xs" :style="{ color: 'var(--textMuted)' }">
        {{ formatMainValue(craziestDay.count) }}
      </div>
    </div>

    <!-- Compact statistics grid -->
    <div class="flex-1 grid grid-cols-2 gap-2 min-h-0">
      <!-- Craziest day -->
      <div
        class="rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderSecondary)'
        }"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold" :style="{ color: 'var(--textPrimary)' }">{{
            craziestDay.count
          }}</span>
          <span class="mx-1" :style="{ color: 'var(--textSecondary)' }">/</span>
          <span class="text-xs" :style="{ color: 'var(--textSecondary)' }">Peak</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs mb-1 truncate" :style="{ color: 'var(--textSecondary)' }">Peak</div>
          <div class="text-sm font-bold truncate" :style="{ color: 'var(--textPrimary)' }">
            {{ craziestDay.count }}
          </div>
        </div>
      </div>

      <!-- Laziest day -->
      <div
        class="rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderSecondary)'
        }"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold" :style="{ color: 'var(--textPrimary)' }">{{
            laziestDay.count
          }}</span>
          <span class="mx-1" :style="{ color: 'var(--textSecondary)' }">/</span>
          <span class="text-xs" :style="{ color: 'var(--textSecondary)' }">Low</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs mb-1 truncate" :style="{ color: 'var(--textSecondary)' }">Low</div>
          <div class="text-sm font-bold truncate" :style="{ color: 'var(--textPrimary)' }">
            {{ laziestDay.count }}
          </div>
        </div>
      </div>

      <!-- Consecutive active days -->
      <div
        class="rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderSecondary)'
        }"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold" :style="{ color: 'var(--textPrimary)' }"
            >{{ longestStreak }}d</span
          >
          <span class="mx-1" :style="{ color: 'var(--textSecondary)' }">/</span>
          <span class="text-xs" :style="{ color: 'var(--textSecondary)' }">Streak</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs mb-1 truncate" :style="{ color: 'var(--textSecondary)' }">Streak</div>
          <div class="text-sm font-bold truncate" :style="{ color: 'var(--textPrimary)' }">
            {{ longestStreak }}d
          </div>
        </div>
      </div>

      <!-- Average per day -->
      <div
        class="rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
        :style="{
          backgroundColor: 'var(--bgTertiary)',
          border: '1px solid var(--borderSecondary)'
        }"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold" :style="{ color: 'var(--textPrimary)' }">{{
            averageDaily.toFixed(0)
          }}</span>
          <span class="mx-1" :style="{ color: 'var(--textSecondary)' }">/</span>
          <span class="text-xs" :style="{ color: 'var(--textSecondary)' }">Avg</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs mb-1 truncate" :style="{ color: 'var(--textSecondary)' }">Avg</div>
          <div class="text-sm font-bold truncate" :style="{ color: 'var(--textPrimary)' }">
            {{ averageDaily.toFixed(0) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useShellData } from '@renderer/composables/useShellData.js'

const { getDailyStats, isLoading } = useShellData()
const dailyStats = ref({})
const containerRef = ref(null)
const isCompactMode = ref(false)

// Detect container height
const checkContainerHeight = () => {
  nextTick(() => {
    if (containerRef.value) {
      const height = containerRef.value.offsetHeight
      const shouldUseCompactMode = height < 100 // Adjust threshold

      if (shouldUseCompactMode !== isCompactMode.value) {
        isCompactMode.value = shouldUseCompactMode

        // Add or remove compact-mode class
        if (isCompactMode.value) {
          containerRef.value.classList.add('compact-mode')
        } else {
          containerRef.value.classList.remove('compact-mode')
        }
      }
    }
  })
}

// Use ResizeObserver to monitor container size changes
let resizeObserver = null

onMounted(() => {
  loadExtremeStats()

  nextTick(() => {
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        checkContainerHeight()
      })
      resizeObserver.observe(containerRef.value)
      checkContainerHeight() // Initial check
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
  }
})

// Calculate extreme values
const laziestDay = computed(() => {
  const days = Object.entries(dailyStats.value)
  if (days.length === 0) return { count: 0, date: '--' }

  const laziest = days.reduce((min, [date, count]) => (count < min.count ? { count, date } : min), {
    count: Infinity,
    date: ''
  })

  return {
    count: laziest.count,
    date: new Date(laziest.date).toLocaleDateString()
  }
})

const craziestDay = computed(() => {
  const days = Object.entries(dailyStats.value)
  if (days.length === 0) return { count: 0, date: '--' }

  const craziest = days.reduce(
    (max, [date, count]) => (count > max.count ? { count, date } : max),
    { count: 0, date: '' }
  )

  return {
    count: craziest.count,
    date: new Date(craziest.date).toLocaleDateString()
  }
})

const longestStreak = computed(() => {
  const dates = Object.keys(dailyStats.value).sort()
  if (dates.length === 0) return 0

  let maxStreak = 0
  let currentStreak = 0
  let lastDate = null

  dates.forEach((dateStr) => {
    const currentDate = new Date(dateStr)

    if (lastDate) {
      const daysDiff = (currentDate - lastDate) / (1000 * 60 * 60 * 24)
      if (daysDiff === 1) {
        currentStreak++
      } else {
        maxStreak = Math.max(maxStreak, currentStreak)
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }

    lastDate = currentDate
  })

  return Math.max(maxStreak, currentStreak)
})

// Calculate daily average
const averageDaily = computed(() => {
  const days = Object.entries(dailyStats.value)
  if (days.length === 0) return 0

  const total = days.reduce((sum, [date, count]) => sum + count, 0)
  return total / days.length
})

// Format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// Format main values
const formatMainValue = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1)
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1)
  }
  return num.toString()
}

// Get main unit
const getMainUnit = (num) => {
  if (num >= 1000000) {
    return 'M'
  } else if (num >= 1000) {
    return 'K'
  }
  return 'MAX'
}

// Load daily statistics data
const loadExtremeStats = async () => {
  try {
    const result = await getDailyStats()
    if (result && typeof result === 'object') {
      dailyStats.value = result
    }
  } catch (err) {
    console.error('Failed to load extreme stats:', err)
  }
}

onMounted(() => {
  loadExtremeStats()
})
</script>

<style scoped>
/* Responsive statistics item layout */
.compact-stat-item {
  position: relative;
}

/* Default to normal layout */
.normal-layout {
  display: flex;
}

.compact-layout {
  display: none;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* Switch to compact layout when parent container height is small */
@media (max-height: 600px) {
  .compact-stat-item .normal-layout {
    display: none;
  }

  .compact-stat-item .compact-layout {
    display: flex;
  }
}

/* More aggressive small screen adaptation */
@media (max-height: 500px) {
  .compact-layout span {
    font-size: 0.625rem !important;
  }

  .compact-layout .text-sm {
    font-size: 0.75rem !important;
  }
}

/* Use CSS container queries (if supported) */
@supports (container-type: inline-size) {
  .compact-stat-item {
    container-type: size;
  }

  @container (max-height: 40px) {
    .normal-layout {
      display: none !important;
    }

    .compact-layout {
      display: flex !important;
    }
  }
}

/* Use variables to control layout mode */
.compact-mode .normal-layout {
  display: none !important;
}

.compact-mode .compact-layout {
  display: flex !important;
}
</style>
