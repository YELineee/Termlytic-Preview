<template>
  <div
    ref="containerRef"
    class="w-full h-full bg-gray-900 rounded-lg p-3 flex flex-col border border-gray-800 min-h-0"
  >
    <!-- Title -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <div class="flex items-center space-x-2">
        <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <h3 class="text-xs text-gray-400 uppercase tracking-wider font-medium">PAID INVOICES</h3>
      </div>
      <div class="text-xs text-gray-500">{{ formatMainValue(craziestDay.count) }}</div>
    </div>

    <!-- 紧凑Statistics网格 -->
    <div class="flex-1 grid grid-cols-2 gap-2 min-h-0">
      <!-- 最疯狂的一天 -->
      <div
        class="bg-gray-800 border border-gray-700 rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold text-white">{{ craziestDay.count }}</span>
          <span class="text-gray-400 mx-1">/</span>
          <span class="text-xs text-red-400">Peak</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs text-red-400 mb-1 truncate">Peak</div>
          <div class="text-sm font-bold text-white truncate">{{ craziestDay.count }}</div>
        </div>
      </div>

      <!-- 最懒的一天 -->
      <div
        class="bg-gray-800 border border-gray-700 rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold text-white">{{ laziestDay.count }}</span>
          <span class="text-gray-400 mx-1">/</span>
          <span class="text-xs text-blue-400">Low</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs text-blue-400 mb-1 truncate">Low</div>
          <div class="text-sm font-bold text-white truncate">{{ laziestDay.count }}</div>
        </div>
      </div>

      <!-- 连续活跃 -->
      <div
        class="bg-gray-800 border border-gray-700 rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold text-white">{{ longestStreak }}d</span>
          <span class="text-gray-400 mx-1">/</span>
          <span class="text-xs text-green-400">Streak</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs text-green-400 mb-1 truncate">Streak</div>
          <div class="text-sm font-bold text-white truncate">{{ longestStreak }}d</div>
        </div>
      </div>

      <!-- 平均每天 -->
      <div
        class="bg-gray-800 border border-gray-700 rounded p-2 flex justify-center items-center min-h-0 compact-stat-item"
      >
        <div class="compact-layout hidden">
          <span class="text-sm font-bold text-white">{{ averageDaily.toFixed(0) }}</span>
          <span class="text-gray-400 mx-1">/</span>
          <span class="text-xs text-purple-400">Avg</span>
        </div>
        <div class="normal-layout flex flex-col text-center">
          <div class="text-xs text-purple-400 mb-1 truncate">Avg</div>
          <div class="text-sm font-bold text-white truncate">{{ averageDaily.toFixed(0) }}</div>
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

// 检测容器高度
const checkContainerHeight = () => {
  nextTick(() => {
    if (containerRef.value) {
      const height = containerRef.value.offsetHeight
      const shouldUseCompactMode = height < 100 // 调整阈值

      if (shouldUseCompactMode !== isCompactMode.value) {
        isCompactMode.value = shouldUseCompactMode

        // 添加或移除compact-mode类
        if (isCompactMode.value) {
          containerRef.value.classList.add('compact-mode')
        } else {
          containerRef.value.classList.remove('compact-mode')
        }
      }
    }
  })
}

// 使用ResizeObserver监听容器尺寸变化
let resizeObserver = null

onMounted(() => {
  loadExtremeStats()

  nextTick(() => {
    if (containerRef.value) {
      resizeObserver = new ResizeObserver(() => {
        checkContainerHeight()
      })
      resizeObserver.observe(containerRef.value)
      checkContainerHeight() // 初始检查
    }
  })
})

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
  }
})

// 计算极值
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

// 计算平均每日
const averageDaily = computed(() => {
  const days = Object.entries(dailyStats.value)
  if (days.length === 0) return 0

  const total = days.reduce((sum, [date, count]) => sum + count, 0)
  return total / days.length
})

// 格式化数字
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toLocaleString()
}

// 格式化主要数值
const formatMainValue = (num) => {
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
  return 'MAX'
}

// Load每日StatisticsData
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
/* 响应式Statistics项布局 */
.compact-stat-item {
  position: relative;
}

/* 默认显示普通布局 */
.normal-layout {
  display: flex;
}

.compact-layout {
  display: none;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

/* 当父容器高度很小时，切换到紧凑布局 */
@media (max-height: 600px) {
  .compact-stat-item .normal-layout {
    display: none;
  }

  .compact-stat-item .compact-layout {
    display: flex;
  }
}

/* 更加激进的小屏幕适配 */
@media (max-height: 500px) {
  .compact-layout span {
    font-size: 0.625rem !important;
  }

  .compact-layout .text-sm {
    font-size: 0.75rem !important;
  }
}

/* 使用CSS容器查询（如果支持） */
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

/* 使用变量控制布局模式 */
.compact-mode .normal-layout {
  display: none !important;
}

.compact-mode .compact-layout {
  display: flex !important;
}
</style>
