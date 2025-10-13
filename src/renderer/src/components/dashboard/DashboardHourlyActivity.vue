<template>
  <div class="card">
    <!-- Title -->
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center space-x-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: 'var(--textSecondary)' }"
        ></div>
        <h3
          class="text-xs text-secondary uppercase tracking-wider font-medium dashboard-truncate-responsive"
        >
          <span class="responsive-hide-small">24-HOUR ACTIVITY</span>
          <span class="hidden responsive-hide-small responsive-hide-xs">24-HOUR</span>
          <span class="hidden responsive-hide-xs">24H</span>
        </h3>
      </div>
    </div>

    <!-- Chart container -->
    <div class="flex-1 flex flex-col">
      <!-- Stats Grid -->
      <div class="grid grid-cols-3 gap-2.5 mb-4">
        <!-- Peak Hour -->
        <div class="stats-card">
          <div class="text-[10px] uppercase tracking-wide mb-1.5" :style="{ color: 'var(--textTertiary)' }">Peak</div>
          <div class="text-lg font-bold" :style="{ color: 'var(--textPrimary)' }">{{ mostActiveHour }}:00</div>
          <div class="text-[10px] mt-0.5" :style="{ color: 'var(--textSecondary)' }">{{ maxCommands }} cmds</div>
        </div>

        <!-- Average -->
        <div class="stats-card">
          <div class="text-[10px] uppercase tracking-wide mb-1.5" :style="{ color: 'var(--textTertiary)' }">Average</div>
          <div class="text-lg font-bold" :style="{ color: 'var(--textPrimary)' }">{{ averagePerHour }}</div>
          <div class="text-[10px] mt-0.5" :style="{ color: 'var(--textSecondary)' }">per hour</div>
        </div>

        <!-- Total -->
        <div class="stats-card">
          <div class="text-[10px] uppercase tracking-wide mb-1.5" :style="{ color: 'var(--textTertiary)' }">Total</div>
          <div class="text-lg font-bold" :style="{ color: 'var(--textPrimary)' }">{{ formatTotalCommands(totalCommands) }}</div>
          <div class="text-[10px] mt-0.5" :style="{ color: 'var(--textSecondary)' }">commands</div>
        </div>
      </div>

      <!-- EChart chart area -->
      <div class="chart-container">
        <EChartWrapper v-if="!loading" :option="chartOption" width="100%" height="100%" />
        <div v-else class="flex items-center justify-center h-full">
          <div class="text-xs text-secondary">Loading...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import EChartWrapper from '../wrapper/EChartWrapper.vue'
import dataCenter from '../../utils/dataProcessingCenter.js'
import { getIntensityColor } from '../../composables/useChartTheme'
import { useTheme } from '../../composables/useTheme'

const { currentThemeMode } = useTheme()

const commands = ref(Array(24).fill(0))
const loading = ref(false)
const mostActiveHour = ref(0)
const totalCommands = ref(0)

// Computed properties
const maxCommands = computed(() => {
  if (!Array.isArray(commands.value) || commands.value.length === 0) {
    return 0
  }
  return Math.max(...commands.value)
})
const averagePerHour = computed(() => Math.round(totalCommands.value / 24))

// EChart configuration
const chartOption = computed(() => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}`)
  const isDark = currentThemeMode.value === 'dark'

  // Pre-calculate colors for use in callbacks
  const textColor = isDark ? '#9CA3AF' : '#6B7280'
  const labelColor = isDark ? '#D1D5DB' : '#374151'
  const tooltipBg = isDark ? '#1F2937' : '#FFFFFF'
  const tooltipBorder = isDark ? '#374151' : '#E5E7EB'
  const gridColor = isDark ? '#374151' : '#F3F4F6'

  // Pre-calculate max value for color intensity
  const maxValue = maxCommands.value || 1
  const dataArray = Array.isArray(commands.value) ? commands.value : Array(24).fill(0)

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#F9FAFB' : '#111827',
        fontSize: 11
      },
      extraCssText: `
        box-shadow: ${
          isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        };
        border-radius: 6px;
        padding: 6px 10px;
      `,
      formatter: function (params) {
        const point = params[0]
        const hour = point.name.padStart(2, '0')
        return `<div style="padding: 2px;">
          <div style="color: ${labelColor}; font-weight: 600; font-size: 11px;">${hour}:00</div>
          <div style="margin-top: 2px; color: ${textColor}; font-size: 10px;">${point.value} commands</div>
        </div>`
      }
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '12%',
      top: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLabel: {
        fontSize: 9,
        color: textColor,
        interval: 2, // Show every 3rd hour
        rotate: 0,
        margin: 8
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: gridColor,
          type: 'dashed',
          width: 1
        }
      }
    },
    yAxis: {
      type: 'value',
      show: false,
      splitNumber: 3
    },
    series: [
      {
        data: dataArray,
        type: 'bar',
        barWidth: '85%',
        itemStyle: {
          color: function (params) {
            const value = params.value
            return getIntensityColor(value, maxValue, isDark)
          },
          borderRadius: [3, 3, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowOffsetY: -2,
            shadowColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }
        },
        animationDelay: function (idx) {
          return idx * 8
        }
      }
    ],
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut'
  }
})

// Format total commands
const formatTotalCommands = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Load hourly distribution data (using optimized data center)
const loadHourlyStats = async () => {
  try {
    loading.value = true

    const hourlyStats = await dataCenter.getSpecificStats('hourly')

    // Validate return data format
    if (hourlyStats && Array.isArray(hourlyStats.data)) {
      commands.value = hourlyStats.data
      mostActiveHour.value = hourlyStats.mostActive || 0
      totalCommands.value = hourlyStats.total || 0
    } else {
      console.warn('Invalid hourly stats format:', hourlyStats)
      // Use default value
      commands.value = Array(24).fill(0)
      mostActiveHour.value = 0
      totalCommands.value = 0
    }
  } catch (err) {
    console.error('Failed to load hourly stats:', err)
    // Ensure default value
    commands.value = Array(24).fill(0)
    mostActiveHour.value = 0
    totalCommands.value = 0
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHourlyStats()
})
</script>

<style scoped>
.stats-card {
  background-color: var(--bgTertiary);
  border: 1px solid var(--borderSecondary);
  border-radius: 0.5rem;
  padding: 0.5rem;
  transition: all 0.2s;
}

.stats-card:hover {
  border-color: var(--textTertiary);
  transform: translateY(-1px);
}

.chart-container {
  flex: 1;
  min-height: 0;
  min-height: 140px;
}
</style>
